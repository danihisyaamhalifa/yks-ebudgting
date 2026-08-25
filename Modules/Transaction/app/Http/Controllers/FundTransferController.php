<?php

namespace Modules\Transaction\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Modules\DataMaster\Models\FundSource;
use Modules\Transaction\Models\FundTransfer;
use Modules\Transaction\Services\CashMutationService;

class FundTransferController extends BaseApiController
{
    protected $searchableColumns = ['transfer_no'];
    protected $filterableColumns = ['transfer_date','from_fund_source_id', 'to_fund_source_id', 'transfer_type','status'];
    protected $sortableColumns = ['transfer_no'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    private CashMutationService $cashMutationService;

    public function __construct(CashMutationService $cashMutationService)
    {
        parent::__construct(new FundTransfer());
        $this->cashMutationService = $cashMutationService;
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with([
                'fromFundSource',
                'toFundSource',
                'source'
            ])
            ->orderBy('transfer_no');

        $this->applySearch($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $page = $request->input('page', 1);
        $perPage = $this->getPerPage($request);

        $data = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->formatDataTableResponse($data, $request);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'transfer_date' => 'required|date',
            'from_fund_source_id' => 'required|exists:fund_sources,id',
            'to_fund_source_id' => 'required|exists:fund_sources,id|different:from_fund_source_id',
            'transfer_type' => 'required|in:disbursement,withdrawal,deposit,adjustment',
            'amount' => 'required|numeric|min:0.01',
            'source_type' => 'nullable|string',
            'source_id' => 'nullable|integer|required_with:source_type',
            'reference_no' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,completed',
        ]);

        // Validasi mengecek balance dr fund source
        $validator->after(function ($validator) use ($request) {
            if ($request->from_fund_source_id && $request->amount) {
                $fromFundSource = FundSource::find($request->from_fund_source_id);

                if ($fromFundSource && $fromFundSource->isInstitut() && !$fromFundSource->hasSufficientBalance($request->amount)) {
                    $validator->errors()->add(
                        'amount',
                        'Saldo ' . $fromFundSource->name . ' tidak mencukupi. Tersedia: ' . $fromFundSource->formatted_balance
                    );
                }
            }

            // Validasi source morph
            // if ($request->source_type && $request->source_id) {
            //     if (!class_exists($request->source_type)) {
            //         $validator->errors()->add('source_type', 'Invalid source type');
            //     } else {
            //         $exists = $request->source_type::where('id', $request->source_id)->exists();
            //         if (!$exists) {
            //             $validator->errors()->add('source_id', 'Source record not found');
            //         }
            //     }
            // }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal '. $validator->errors(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = [
                'transfer_date' => $request->transfer_date,
                'from_fund_source_id' => $request->from_fund_source_id,
                'to_fund_source_id' => $request->to_fund_source_id,
                'transfer_type' => $request->transfer_type,
                'amount' => $request->amount,
                'source_type' => $request->source_type,
                'source_id' => $request->source_id,
                'reference_no' => $request->reference_no,
                'notes' => $request->notes,
                'status' => $request->status ?? 'draft',
                'completed_at' => ($request->status ?? 'draft') === 'completed' ? now() : null,
            ];

            $fundTransfer = FundTransfer::create($data);

            // Jika status completed, create cash mutations
            if ($fundTransfer->status === 'completed') {
                $this->cashMutationService->createFromFundTransfer($fundTransfer);
            }

            // Load relationships
            $fundTransfer->load([
                'fromFundSource',
                'toFundSource',
                'source',
                'cashMutations',
                'createdBy',
                'updatedBy',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer dana berhasil dibuat',
                'data' => $fundTransfer
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fund transfer creation failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan transfer dana',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'transfer_date' => 'sometimes|required|date',
            'from_fund_source_id' => 'sometimes|required|exists:fund_sources,id',
            'to_fund_source_id' => 'sometimes|required|exists:fund_sources,id|different:from_fund_source_id',
            'transfer_type' => 'sometimes|required|in:disbursement,withdrawal,deposit,adjustment',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'source_type' => 'nullable|string',
            'source_id' => 'nullable|integer|required_with:source_type',
            'reference_no' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,completed,cancelled',
        ]);

        // Custom validation
        $validator->after(function ($validator) use ($request, $id) {
            $fundTransfer = FundTransfer::find($id);

            if (!$fundTransfer) {
                return;
            }

            // Check if trying to update completed/cancelled transfer
            if ($fundTransfer->isCompleted() && $request->has('status') && $request->status !== 'completed') {
                $validator->errors()->add('status', 'Cannot change status of a completed fund transfer');
            }

            if ($fundTransfer->isCancelled()) {
                $validator->errors()->add('status', 'Cannot update a cancelled fund transfer');
            }

            // Validasi mengecek balance dr fund source
            $fromFundSourceId = $request->from_fund_source_id ?? $fundTransfer->from_fund_source_id;
            $amount = $request->amount ?? $fundTransfer->amount;

            if ($request->status === 'completed' && !$fundTransfer->isCompleted()) {
                $fromFundSource = FundSource::find($fromFundSourceId);

                if ($fromFundSource && $fromFundSource->isInstitut() && !$fromFundSource->hasSufficientBalance($amount)) {
                    $validator->errors()->add(
                        'amount',
                        'Saldo ' . $fromFundSource->name . ' tidak mencukupi. Tersedia: ' . $fromFundSource->formatted_balance
                    );
                }
            }

            // Validate source morph if provided
            // if ($request->source_type && $request->source_id) {
            //     if (!class_exists($request->source_type)) {
            //         $validator->errors()->add('source_type', 'Invalid source type');
            //     } else {
            //         $exists = $request->source_type::where('id', $request->source_id)->exists();
            //         if (!$exists) {
            //             $validator->errors()->add('source_id', 'Source record not found');
            //         }
            //     }
            // }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $fundTransfer = FundTransfer::findOrFail($id);

            $oldStatus = $fundTransfer->status;

            // Prepare update data
            $data = array_filter([
                'transfer_date' => $request->transfer_date,
                'from_fund_source_id' => $request->from_fund_source_id,
                'to_fund_source_id' => $request->to_fund_source_id,
                'transfer_type' => $request->transfer_type,
                'amount' => $request->amount,
                'source_type' => $request->source_type,
                'source_id' => $request->source_id,
                'reference_no' => $request->reference_no,
                'notes' => $request->notes,
                'status' => $request->status,
            ], function ($value) {
                return $value !== null;
            });

            // Set completed_at based on status
            if (isset($data['status']) && $data['status'] === 'completed' && $oldStatus !== 'completed') {
                $data['completed_at'] = now();
            } elseif (isset($data['status']) && $data['status'] !== 'completed') {
                $data['completed_at'] = null;
            }

            $fundTransfer->update($data);

            // Handle cash mutations berdasarkan status
            if ($fundTransfer->status === 'completed' && $oldStatus !== 'completed') {
                // Create cash mutations jika stataus dr draft ke completed
                $this->cashMutationService->createFromFundTransfer($fundTransfer);
            } elseif ($oldStatus === 'completed' && $fundTransfer->status !== 'completed') {
                // Reverse/delete cash mutations jika stataus dr completed ke draft
                $this->cashMutationService->reverseFromFundTransfer($fundTransfer);
            } elseif ($fundTransfer->status === 'completed' && $oldStatus === 'completed') {
                $this->cashMutationService->updateFromFundTransfer($fundTransfer);
            }

            // Load relationships
            $fundTransfer->load([
                'fromFundSource',
                'toFundSource',
                'source',
                'cashMutations',
                'createdBy',
                'updatedBy',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer dana sukses diperbarui',
                'data' => $fundTransfer
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Sumber dana tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Fund transfer update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui transfer dana',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $fundTransfer = FundTransfer::findOrFail($id);

            // Validasi status draft
            if (!$fundTransfer->isDraft()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya transfer dalam status draft yang dapat dihapus',
                ], 422);
            }

            $fundTransfer->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer dana sukses dihapus',
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Sumber dana tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to delete fund transfer: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus transfer dana',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
