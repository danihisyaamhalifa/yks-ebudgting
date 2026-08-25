<?php

namespace Modules\Disbursement\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\Disbursement\Http\Requests\BudgetAccountabilityRequest;
use Modules\Disbursement\Models\BudgetAccountability;
use Modules\Disbursement\Models\BudgetAccountabilityDocument;
use Modules\Disbursement\Models\BudgetAccountabilityItem;
use Modules\Disbursement\Models\BudgetAccountabilityReturn;
use Modules\Disbursement\Models\BudgetFundRelease;
use Modules\Transaction\Services\CashMutationService;

class BudgetAccountabilityController extends BaseApiController
{
    protected $searchableColumns = ['accountability_no', 'accountability_date'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['accountability_no', 'accountability_date', 'status', 'total_received', 'total_spent'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct(
        // private CashMutationService $cashMutationService
    ) {
        parent::__construct(new BudgetAccountability());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with([
                'fundRelease',
                'fundRelease.disbursementHeader',
                'fundRelease.disbursementHeader.requestHeader',
                'fundRelease.disbursementHeader.requestHeader.unit:id,unit_name',
            ]);

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
        $formRequest = app(BudgetAccountabilityRequest::class);
        validator($request->all(), $formRequest->rules())->validate();

        try {
            DB::beginTransaction();

            // Validasi BudgetFundRelease
            $fundRelease = BudgetFundRelease::findOrFail($request->budget_fund_release_id);

            if ($fundRelease->status !== 'transferred') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya pencairan dana dengan status "Sudah Ditransfer" yang dapat dipertanggungjawabkan.',
                ], 422);
            }

            // Validasi total
            $totalSpent = $request->total_spent ?? 0;
            $totalReturned = $request->total_returned ?? 0;
            $totalReceived = $request->total_received;

            if (($totalSpent + $totalReturned) > $totalReceived) {
                return response()->json([
                    'success' => false,
                    'message' => 'Total pengeluaran + pengembalian tidak boleh melebihi total diterima.',
                ], 422);
            }

            // Simpan BudgetAccountability
            $accountability = BudgetAccountability::create([
                'accountability_no' => $request->accountability_no,
                'accountability_date' => $request->accountability_date,
                'budget_fund_release_id' => $request->budget_fund_release_id,
                'budget_fund_release_item_id' => $request->budget_fund_release_item_id ?? null,
                'total_received' => $totalReceived,
                'total_spent' => $totalSpent,
                'total_returned' => $totalReturned,
                'status' => $request->status ?? 'draft',
                'notes' => $request->notes,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            // Simpan Items (Pengeluaran)
            $this->syncItems($accountability, $request->items ?? []);

            // Simpan Returns (Pengembalian)
            $this->syncReturns($accountability, $request->returns ?? []);

            // Simpan Documents
            if ($request->hasFile('files')) {
                $this->storeFiles($request, $accountability->id);
            }

            // Jika status approved, trigger mutasi kas
            if ($accountability->status === 'approved') {
                $this->processApprovedReturns($accountability);
            }

            DB::commit();

            $accountability->load(['items', 'returns', 'documents', 'fundRelease', 'fundReleaseItem']);

            return response()->json([
                'success' => true,
                'message' => 'Pertanggungjawaban anggaran berhasil disimpan.',
                'data' => $accountability,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal simpan pertanggungjawaban: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        try {
            $accountability = BudgetAccountability::with([
                'fundRelease',
                'fundReleaseItem',
                'items',
                'returns.fundSource',
                'documents',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data pertanggungjawaban berhasil diambil',
                'data' => $accountability,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data pertanggungjawaban tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pertanggungjawaban',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $formRequest = app(BudgetAccountabilityRequest::class);
        validator($request->all(), $formRequest->rules())->validate();

        try {
            DB::beginTransaction();

            $accountability = BudgetAccountability::findOrFail($id);

            if (!in_array($accountability->status, ['draft', 'returned'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pertanggungjawaban dengan status ini tidak dapat diubah.',
                ], 422);
            }

            $totalSpent = $request->total_spent ?? 0;
            $totalReturned = $request->total_returned ?? 0;
            $totalReceived = $request->total_received;

            if (($totalSpent + $totalReturned) > $totalReceived) {
                return response()->json([
                    'success' => false,
                    'message' => 'Total pengeluaran + pengembalian tidak boleh melebihi total diterima.',
                ], 422);
            }

            $accountability->update([
                'accountability_date' => $request->accountability_date,
                'budget_fund_release_item_id' => $request->budget_fund_release_item_id ?? $accountability->budget_fund_release_item_id,
                'total_received' => $totalReceived,
                'total_spent' => $totalSpent,
                'total_returned' => $totalReturned,
                'status' => $request->status ?? $accountability->status,
                'notes' => $request->notes,
                'updated_by' => Auth::id(),
            ]);

            // Sync items & returns
            $this->syncItems($accountability, $request->items ?? []);
            $this->syncReturns($accountability, $request->returns ?? []);

            // Handle files
            if ($request->hasFile('files')) {
                $this->storeFiles($request, $accountability->id);
            }

            // Jika status berubah ke approved, trigger mutasi kas
            // if ($accountability->wasChanged('status') && $accountability->status === 'approved') {
            //     $this->processApprovedReturns($accountability);
            // }

            DB::commit();

            $accountability->load(['items', 'returns', 'documents', 'fundRelease', 'fundReleaseItem']);

            return response()->json([
                'success' => true,
                'message' => 'Pertanggungjawaban anggaran berhasil diperbarui.',
                'data' => $accountability,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal update pertanggungjawaban: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $accountability = BudgetAccountability::findOrFail($id);

            // if (!in_array($accountability->status, ['draft'])) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Hanya pertanggungjawaban dengan status "Draft" yang dapat dihapus.',
            //     ], 422);
            // }

            // Hapus file fisik
            foreach ($accountability->documents as $document) {
                if (Storage::disk('public')->exists($document->file_path)) {
                    Storage::disk('public')->delete($document->file_path);
                }
            }

            $accountability->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pertanggungjawaban anggaran berhasil dihapus.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal menghapus pertanggungjawaban: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync accountability items.
     */
    private function syncItems(BudgetAccountability $accountability, array $items): void
    {
        $existingIds = collect($items)->pluck('id')->filter()->toArray();

        // Hapus items yang tidak ada di request
        BudgetAccountabilityItem::where('budget_accountability_id', $accountability->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($items as $data) {
            if (!empty($data['id'])) {
                BudgetAccountabilityItem::where('id', $data['id'])
                    ->where('budget_accountability_id', $accountability->id)
                    ->update([
                        'expense_date' => $data['expense_date'],
                        'description' => $data['description'],
                        'amount' => $data['amount'],
                        'receipt_no' => $data['receipt_no'] ?? null,
                        'notes' => $data['notes'] ?? null,
                    ]);
            } else {
                BudgetAccountabilityItem::create([
                    'budget_accountability_id' => $accountability->id,
                    'expense_date' => $data['expense_date'],
                    'description' => $data['description'],
                    'amount' => $data['amount'],
                    'receipt_no' => $data['receipt_no'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);
            }
        }
    }

    /**
     * Sync accountability returns.
     */
    private function syncReturns(BudgetAccountability $accountability, array $returns): void
    {
        $existingIds = collect($returns)->pluck('id')->filter()->toArray();

        BudgetAccountabilityReturn::where('budget_accountability_id', $accountability->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($returns as $data) {
            if (!empty($data['id'])) {
                BudgetAccountabilityReturn::where('id', $data['id'])
                    ->where('budget_accountability_id', $accountability->id)
                    ->update([
                        'return_date' => $data['return_date'],
                        'amount' => $data['amount'],
                        'receipt_no' => $data['receipt_no'] ?? null,
                        'fund_source_id' => $data['fund_source_id'] ?? null,
                        'notes' => $data['notes'] ?? null,
                    ]);
            } else {
                BudgetAccountabilityReturn::create([
                    'budget_accountability_id' => $accountability->id,
                    'return_date' => $data['return_date'],
                    'amount' => $data['amount'],
                    'receipt_no' => $data['receipt_no'] ?? null,
                    'fund_source_id' => $data['fund_source_id'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ]);
            }
        }
    }

    /**
     * Process approved returns → cash mutations.
     */
    private function processApprovedReturns(BudgetAccountability $accountability): void
    {
        // foreach ($accountability->returns as $return) {
        //     if ($return->fund_source_id) {
        //         $this->cashMutationService->createFromReturn($return);
        //     }
        // }
    }

    /**
     * Store file upload documents.
     */
    private function storeFiles(Request $request, int $accountabilityId): void
    {
        if (!$request->hasFile('files')) return;

        foreach ($request->file('files') as $file) {
            $path = $file->store('accountability-documents', 'public');

            BudgetAccountabilityDocument::create([
                'budget_accountability_id' => $accountabilityId,
                'document_name' => $file->getClientOriginalName(),
                'file_name' => basename($path),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'file_type' => $file->getMimeType(),
                'uploaded_by' => Auth::id(),
            ]);
        }
    }
}