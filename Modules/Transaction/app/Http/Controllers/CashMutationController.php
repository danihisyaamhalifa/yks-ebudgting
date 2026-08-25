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
use Modules\Transaction\Models\CashMutation;

class CashMutationController extends BaseApiController
{
    protected $searchableColumns = ['mutation_no'];
    protected $filterableColumns = ['type', 'fund_source_id', 'mutation_date'];
    protected $sortableColumns = ['mutation_no'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new CashMutation());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with([
                'fundSource',
            ])
            ->orderBy('mutation_no');

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
            'mutation_date'    => 'required|date',
            'fund_source_id'   => 'required|exists:fund_sources,id',
            'type'             => 'required|in:in,out',
            'amount'           => 'required|numeric|min:0.01',
            'description'      => 'required|string|max:255',
            'source_type'      => 'nullable|string',
            'source_id'        => 'nullable|integer|required_with:source_type',
            'notes'            => 'nullable|string|max:500',
        ]);

        // Validasi kustom
        $validator->after(function ($validator) use ($request) {
            //1. Validasi cek balance dr fund source
            if ($request->type === 'out' && $request->fund_source_id && $request->amount) {
                $fundSource = FundSource::find($request->fund_source_id);

                if ($fundSource) {
                    if (!$fundSource->hasSufficientBalance($request->amount)) {
                        $validator->errors()->add(
                            'amount',
                            'Saldo ' . $fundSource->name . ' tidak mencukupi. Tersedia: ' . $fundSource->formatted_balance .
                                ', Dibutuhkan: ' . number_format($request->amount, 2)
                        );
                    }
                }
            }

            // 2. Validasi cek source morph
            if ($request->source_type && $request->source_id) {
                if (!class_exists($request->source_type)) {
                    $validator->errors()->add('source_type', 'Invalid source type. Class does not exist.');
                } else {
                    try {
                        $exists = $request->source_type::where('id', $request->source_id)->exists();
                        if (!$exists) {
                            $validator->errors()->add('source_id', 'Source record not found in ' . class_basename($request->source_type));
                        }
                    } catch (\Exception $e) {
                        $validator->errors()->add('source_type', 'Cannot validate source type');
                    }
                }
            }

            // 3. Validasi tanggak mutasi
            if ($request->mutation_date && strtotime($request->mutation_date) > time()) {
                $validator->errors()->add(
                    'mutation_date',
                    'Tanggal mutasi tidak boleh lebih dari hari ini'
                );
            }
        });

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal ' . $validator->errors(),
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Lock fund source untuk mencegah race condition
            $fundSource = FundSource::lockForUpdate()->findOrFail($request->fund_source_id);

            // Get current balance
            $currentBalance = $fundSource->balance;

            // Calculate new balance
            if ($request->type === 'in') {
                $newBalance = $currentBalance + $request->amount;
            } else {
                $newBalance = $currentBalance - $request->amount;
            }

            // Final balance validation
            if ($newBalance < 0) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors'  => [
                        'amount' => [
                            'Insufficient balance. ' .
                                'Available: ' . $fundSource->formatted_balance .
                                ', Requested: ' . number_format($request->amount, 2)
                        ]
                    ]
                ], 422);
            }

            // Create cash mutation
            $cashMutation = CashMutation::create([
                'mutation_date'  => $request->mutation_date,
                'fund_source_id' => $request->fund_source_id,
                'type'           => $request->type,
                'amount'         => $request->amount,
                'description'    => $request->description,
                'source_type'    => $request->source_type,
                'source_id'      => $request->source_id,
                'balance'        => $newBalance,
                'notes'          => $request->notes,
            ]);

            // Load relationships
            $cashMutation->load([
                'fundSource',
                'source',
                'createdBy',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cash mutation created successfully',
                'data'    => $cashMutation
            ], 201);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Fund source not found',
            ], 404);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to create cash mutation', [
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal buat muttasi kas',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mutation_date'    => 'sometimes|required|date',
            'fund_source_id'   => 'sometimes|required|exists:fund_sources,id',
            'type'             => 'sometimes|required|in:in,out',
            'amount'           => 'sometimes|required|numeric|min:0.01',
            'description'      => 'sometimes|required|string|max:255',
            'source_type'      => 'nullable|string',
            'source_id'        => 'nullable|integer|required_with:source_type',
            'notes'            => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $cashMutation = CashMutation::findOrFail($id);

            // Cek apakah mutasi ini berasal dari FundTransfer (system generated)
            if ($cashMutation->source_type === 'Modules\Transaction\Models\FundTransfer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mutasi kas dari transfer dana tidak dapat diubah secara manual. Ubah transfer dana terkait.',
                ], 422);
            }

            // Cek apakah mutasi ini berasal dari BudgetFundRelease (system generated)
            if ($cashMutation->source_type === 'Modules\Budget\Models\BudgetFundRelease') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mutasi kas dari pencairan dana tidak dapat diubah secara manual. Ubah pencairan dana terkait.',
                ], 422);
            }

            // Cek apakah ini mutasi paling terakhir untuk fund source tersebut
            $fundSourceId = $request->fund_source_id ?? $cashMutation->fund_source_id;
            $latestMutation = CashMutation::where('fund_source_id', $fundSourceId)
                ->latest('mutation_date')
                ->latest('id')
                ->first();

            if ($latestMutation && $latestMutation->id !== $cashMutation->id) {
                // Jika bukan mutasi terakhir, cek apakah mengubah tanggal
                if ($request->has('mutation_date') || $request->has('fund_source_id')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Hanya dapat mengubah mutasi kas terakhir. Mutasi terakhir: ' . $latestMutation->mutation_no . ' (' . $latestMutation->mutation_date->format('d/m/Y') . ')',
                    ], 422);
                }
            }

            // Simpan data lama untuk perbandingan
            $oldFundSourceId = $cashMutation->fund_source_id;
            $oldType = $cashMutation->type;
            $oldAmount = $cashMutation->amount;

            // Tentukan fund_source_id, type, dan amount (baru atau lama)
            $newFundSourceId = $request->fund_source_id ?? $cashMutation->fund_source_id;
            $newType = $request->type ?? $cashMutation->type;
            $newAmount = $request->amount ?? $cashMutation->amount;

            // Validasi balance jika type = out
            if ($newType === 'out') {
                $fundSource = FundSource::find($newFundSourceId);

                if ($fundSource) {
                    // Hitung balance yang tersedia tanpa mutasi ini
                    $availableBalance = $fundSource->balance;

                    // Jika fund source sama, tambahkan kembali amount lama ke balance
                    if ($newFundSourceId == $oldFundSourceId && $oldType === 'out') {
                        $availableBalance += $oldAmount;
                    }

                    if ($availableBalance < $newAmount) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Validasi gagal',
                            'errors'  => [
                                'amount' => [
                                    'Saldo ' . $fundSource->name . ' tidak mencukupi. ' .
                                        'Tersedia: ' . number_format($availableBalance, 2) .
                                        ', Dibutuhkan: ' . number_format($newAmount, 2)
                                ]
                            ]
                        ], 422);
                    }
                }
            }

            // Validasi source morph jika diubah
            if ($request->source_type && $request->source_id) {
                if (!class_exists($request->source_type)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Validasi gagal',
                        'errors'  => [
                            'source_type' => ['Invalid source type. Class does not exist.']
                        ]
                    ], 422);
                } else {
                    try {
                        $exists = $request->source_type::where('id', $request->source_id)->exists();
                        if (!$exists) {
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => 'Validasi gagal',
                                'errors'  => [
                                    'source_id' => ['Source record not found in ' . class_basename($request->source_type)]
                                ]
                            ], 422);
                        }
                    } catch (\Exception $e) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Validasi gagal',
                            'errors'  => [
                                'source_type' => ['Cannot validate source type']
                            ]
                        ], 422);
                    }
                }
            }

            // Validasi tanggal mutasi
            if ($request->mutation_date && strtotime($request->mutation_date) > time()) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors'  => [
                        'mutation_date' => ['Tanggal mutasi tidak boleh lebih dari hari ini']
                    ]
                ], 422);
            }

            // Update data mutasi
            $updateData = array_filter([
                'mutation_date'  => $request->mutation_date,
                'fund_source_id' => $request->fund_source_id,
                'type'           => $request->type,
                'amount'         => $request->amount,
                'description'    => $request->description,
                'source_type'    => $request->source_type,
                'source_id'      => $request->source_id,
                'notes'          => $request->notes,
            ], function ($value) {
                return $value !== null;
            });

            // Jika hanya update notes/description tanpa mengubah amount/type/fund_source
            if (
                !isset($updateData['amount']) &&
                !isset($updateData['type']) &&
                !isset($updateData['fund_source_id'])
            ) {

                $cashMutation->update($updateData);

                DB::commit();

                $cashMutation->load(['fundSource', 'source', 'createdBy']);

                return response()->json([
                    'success' => true,
                    'message' => 'Mutasi kas berhasil diubah',
                    'data'    => $cashMutation
                ], 200);
            }

            // Jika ada perubahan amount/type/fund_source, hitung ulang balance
            $fundSource = FundSource::lockForUpdate()->findOrFail($newFundSourceId);

            // Hitung semua mutasi untuk fund source INI kecuali mutasi yang sedang diupdate
            $totalOtherMutations = CashMutation::where('fund_source_id', $newFundSourceId)
                ->where('id', '!=', $cashMutation->id)
                ->selectRaw("
                SUM(CASE 
                    WHEN type = 'in' THEN amount 
                    WHEN type = 'out' THEN -amount 
                    ELSE 0 
                END) as total
            ")
                ->value('total') ?? 0;

            // Hitung balance baru
            $currentMutationAmount = $newType === 'in' ? $newAmount : -$newAmount;
            $newBalance = $fundSource->initial_balance + $totalOtherMutations + $currentMutationAmount;

            // Validasi balance tidak negatif
            if ($newBalance < 0) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors'  => [
                        'amount' => [
                            'Saldo tidak mencukupi setelah perhitungan ulang. ' .
                                'Saldo awal: ' . number_format($fundSource->initial_balance, 2) .
                                ', Total mutasi lain: ' . number_format($totalOtherMutations, 2) .
                                ', Mutasi ini: ' . number_format($currentMutationAmount, 2)
                        ]
                    ]
                ], 422);
            }

            // Update data termasuk balance baru
            $updateData['balance'] = $newBalance;
            $cashMutation->update($updateData);

            // Load relationships
            $cashMutation->load([
                'fundSource',
                'source',
                'createdBy',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mutasi kas berhasil diubah',
                'data'    => $cashMutation
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Mutasi kas tidak ditemukan',
            ], 404);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Gagal mengubah mutasi kas', [
                'id'      => $id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah mutasi kas',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
