<?php

namespace Modules\Disbursement\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalWorkflow;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\DataMaster\Models\FundSource;
use Modules\Disbursement\Http\Requests\BudgetFundReleaseRequest;
use Modules\Disbursement\Models\BudgetFundRelease;
use Modules\Disbursement\Models\BudgetFundReleaseApproval;
use Modules\Disbursement\Models\BudgetFundReleaseDocument;
use Modules\Disbursement\Models\BudgetFundReleaseItem;
use Modules\Transaction\Models\CashMutation;

class BudgetFundReleaseController extends BaseApiController
{
    protected $searchableColumns = ['fund_release_no'];
    protected $filterableColumns = ['status', 'fund_source_id'];
    protected $sortableColumns = ['fund_release_no', 'fund_release_date', 'amount', 'status'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new BudgetFundRelease());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with([
                'disbursementHeader:id,disbursement_no,disbursement_date,budget_request_header_id',
                'disbursementHeader.requestHeader.unit',
                'fundSource',
                'documents'
            ])
            ->orderBy('fund_release_no');

        if ($request->filled('status')) {
            $statuses = $request->status;

            if (is_array($statuses)) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $statuses);
            }
        }

        if ($request->filled('budget_disbursement_header_id')) {
            $query->where('budget_disbursement_header_id', $request->budget_disbursement_header_id);
        }

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
        $formRequest = app(BudgetFundReleaseRequest::class);
        $validator = validator($request->all(), $formRequest->rules());

        // + validasi kustom untuk cek balance
        $validator->after(function ($validator) use ($request) {
            if (
                in_array($request->status, ['transferred']) &&
                $request->fund_source_id &&
                $request->total_amount
            ) {

                $fundSource = FundSource::find($request->fund_source_id);

                if (!$fundSource) {
                    $validator->errors()->add('fund_source_id', 'Sumber dana tidak ditemukan');
                    return;
                }

                if (!$fundSource->hasSufficientBalance($request->total_amount)) {
                    $validator->errors()->add(
                        'total_amount',
                        'Saldo ' . $fundSource->name . ' tidak mencukupi. Tersedia: ' . $fundSource->formatted_balance .
                            ', Dibutuhkan: ' . number_format($request->total_amount, 2)
                    );
                }
            }
        });

        // Validate rules
        $validator->validate();

        DB::beginTransaction();

        try {
            // Create Budget Fund Release
            $fundRelease = BudgetFundRelease::create([
                'fund_release_date'                => $request->fund_release_date,
                'budget_disbursement_header_id'    => $request->budget_disbursement_header_id,
                'fund_source_id'                   => $request->fund_source_id,
                'payment_type'                     => $request->payment_type,
                'total_amount'                     => $request->total_amount,
                'recipient_bank_name'              => $request->recipient_bank_name,
                'recipient_account_no'             => $request->recipient_account_no,
                'recipient_account_name'           => $request->recipient_account_name,
                'recipient_name'                   => $request->recipient_name,
                'recipient_position'               => $request->recipient_position,
                'recipient_department'             => $request->recipient_department,
                'notes'                            => $request->notes,
                'status'                           => $request->status,
                'created_by'                       => Auth::id(),
            ]);
            

            // Create Budget Fund Release (details)
            if ($request->has('items') && is_array($request->items)) {
                foreach ($request->items as $item) {
                    BudgetFundReleaseItem::create([
                        'budget_fund_release_id'        => $fundRelease->id,
                        'budget_disbursement_item_id'   => $item['budget_disbursement_item_id'],
                        'total_amount'                  => $item['total_amount'],
                        'notes'                         => $item['notes'] ?? null,
                    ]);
                }
            }

            // Store files
            if ($request->hasFile('files')) {
                $this->storeFiles($request, $fundRelease->id);
            }

            // Create Cash Mutation
            if (in_array($fundRelease->status, ['transferred'])) {
                $this->createCashMutation($fundRelease);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budget fund release created',
                'data'    => $fundRelease->load([
                    'disbursementHeader',
                    'fundSource',
                    'documents',
                    'items',
                    'cashMutations'
                ]),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Store Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat realisasi pencairan',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $fundRelease = BudgetFundRelease::with([
            'fundSource:id,name',
            'documents',
            'items.disbursementItem.requestItem',

            // disbursementHeader
            'disbursementHeader' => function ($query) {
                $query->with([
                    'requestActivity',
                    'items.requestItem',

                    // requestHeader
                    'requestHeader' => function ($subQuery) {
                        $subQuery->with([
                            'unit:id,unit_name',
                            'fiscalYear:id,year',
                            'academicPeriod:id,academic_year,semester',
                            'budgetCategory:id,name',
                            'subBudgetCategory:id,name'
                        ]);
                    }
                ])->withSum(['fundReleases as fund_releases_sum_total_amount' => function ($query) {
                    $query->whereNotIn('status', ['rejected']);
                }], 'total_amount');
            }
        ])->findOrFail($id);


        return response()->json([
            'success' => true,
            'data' => $fundRelease
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $formRequest = app(BudgetFundReleaseRequest::class);
        $validator = validator($request->all(), $formRequest->rules());

        // + vaidasi kustom
        $validator->after(function ($validator) use ($request, $id) {
            $fundRelease = BudgetFundRelease::find($id);

            if (!$fundRelease) {
                return;
            }

            // Prevent update if already transferred
            $isCurrentlyTransferred = in_array($fundRelease->status, ['transferred']);
            $willBeTransferred = in_array($request->status, ['transferred']);
            $isChangingFromTransferred = $isCurrentlyTransferred && !$willBeTransferred;

            if ($isChangingFromTransferred) {
                $validator->errors()->add(
                    'status',
                    'Tidak bisa mengubah status dari dibayarkan ke ' . $request->status
                );
                return;
            }

            // Validate balance when creating new transfer or updating existing transferred
            if ($willBeTransferred && !$isCurrentlyTransferred) {
                // Baru akan ditransfer, cek balance
                $fundSourceId = $request->fund_source_id ?? $fundRelease->fund_source_id;
                $amount = $request->total_amount ?? $fundRelease->total_amount;
                $fundSource = FundSource::find($fundSourceId);

                if ($fundSource && !$fundSource->hasSufficientBalance($amount)) {
                    $validator->errors()->add(
                        'total_amount',
                        'Saldo ' . $fundSource->name . ' tidak mencukupi. Tersedia: ' . $fundSource->formatted_balance .
                            ', Dibutuhkan: ' . number_format($amount, 2)
                    );
                }
            } elseif ($willBeTransferred && $isCurrentlyTransferred) {
                // Sudah transferred, update data - cek balance dengan memperhitungkan amount lama
                $fundSourceId = $request->fund_source_id ?? $fundRelease->fund_source_id;
                $newAmount = $request->total_amount ?? $fundRelease->total_amount;
                $oldAmount = $fundRelease->total_amount;
                $oldFundSourceId = $fundRelease->fund_source_id;

                // Jika fund source berubah, perlu validasi berbeda
                if ($fundSourceId != $oldFundSourceId) {
                    $fundSource = FundSource::find($fundSourceId);
                    if ($fundSource && !$fundSource->hasSufficientBalance($newAmount)) {
                        $validator->errors()->add(
                            'total_amount',
                            'Saldo ' . $fundSource->name . ' tidak mencukupi. Tersedia: ' . $fundSource->formatted_balance .
                                ', Dibutuhkan: ' . number_format($newAmount, 2)
                        );
                    }
                } else {
                    // Fund source sama, cek selisih
                    $fundSource = FundSource::find($fundSourceId);
                    $additionalAmount = $newAmount - $oldAmount;

                    if ($additionalAmount > 0 && $fundSource && !$fundSource->hasSufficientBalance($additionalAmount)) {
                        $validator->errors()->add(
                            'Saldo ' . $fundSource->name . ' tidak mencukupi. Tersedia: ' . $fundSource->formatted_balance .
                                ', Dibutuhkan: ' . number_format($additionalAmount, 2)
                        );
                    }
                }
            }

            // Validasi payment_type jika ada
            if ($request->has('payment_type') && $request->payment_type === 'transfer') {
                if (!$request->has('recipient_bank_name') || empty($request->recipient_bank_name)) {
                    $validator->errors()->add('recipient_bank_name', 'Nama bank dibutuhkan untuk transfer');
                }
                if (!$request->has('recipient_account_no') || empty($request->recipient_account_no)) {
                    $validator->errors()->add('recipient_account_no', 'Nomor rekening dibutuhkan untuk transfer');
                }
            }
        });

        // Validate rules
        $validator->validate();

        DB::beginTransaction();

        try {
            $fundRelease = BudgetFundRelease::findOrFail($id);

            // Store old values for comparison
            $oldStatus = $fundRelease->status;
            $oldAmount = $fundRelease->total_amount;
            $oldFundSourceId = $fundRelease->fund_source_id;

            // Update header
            $fundRelease->update([
                'fund_release_no'                  => $request->fund_release_no ?? $fundRelease->fund_release_no,
                'fund_release_date'                => $request->fund_release_date ?? $fundRelease->fund_release_date,
                'budget_disbursement_header_id'    => $request->budget_disbursement_header_id ?? $fundRelease->budget_disbursement_header_id,
                'fund_source_id'                   => $request->fund_source_id ?? $fundRelease->fund_source_id,
                'total_amount'                     => $request->total_amount ?? $fundRelease->total_amount,
                'payment_type'                     => $request->payment_type ?? $fundRelease->payment_type,
                'recipient_bank_name'              => $request->recipient_bank_name ?? $fundRelease->recipient_bank_name,
                'recipient_account_no'             => $request->recipient_account_no ?? $fundRelease->recipient_account_no,
                'recipient_account_name'           => $request->recipient_account_name ?? $fundRelease->recipient_account_name,
                'recipient_name'                   => $request->recipient_name ?? $fundRelease->recipient_name,
                'recipient_position'               => $request->recipient_position ?? $fundRelease->recipient_position,
                'recipient_department'             => $request->recipient_department ?? $fundRelease->recipient_department,
                'notes'                            => $request->notes ?? $fundRelease->notes,
                'status'                           => $request->status ?? $fundRelease->status,
                'updated_by'                       => Auth::id(),
            ]);

            // Update budget fund release items dengan updateOrCreate
            if ($request->has('items') && is_array($request->items)) {
                $processedItemIds = [];

                foreach ($request->items as $itemData) {
                    $item = BudgetFundReleaseItem::updateOrCreate(
                        [
                            'id' => $itemData['id'] ?? null,
                            'budget_fund_release_id' => $fundRelease->id,
                        ],
                        [
                            'budget_disbursement_item_id' => $itemData['budget_disbursement_item_id'],
                            'total_amount' => $itemData['total_amount'],
                            'notes' => $itemData['notes'] ?? null,
                        ]
                    );

                    $processedItemIds[] = $item->id;
                }

                // Hapus items yang tidak ada di request
                BudgetFundReleaseItem::where('budget_fund_release_id', $fundRelease->id)
                    ->whereNotIn('id', $processedItemIds)
                    ->delete();
            } else {
                // Jika items tidak ada di request, hapus semua items (opsional)
                // BudgetFundReleaseItem::where('budget_fund_release_id', $fundRelease->id)->delete();
            }

            // Store new files
            if ($request->hasFile('files')) {
                $this->storeFiles($request, $fundRelease->id);
            }

            // Refresh model untuk mendapatkan data terbaru
            $fundRelease->refresh();

            // Handle cash mutation based on status changes
            $newStatus = $fundRelease->status;
            $isCurrentlyTransferred = in_array($oldStatus, ['transferred']);
            $isNowTransferred = in_array($newStatus, ['transferred']);

            if ($isNowTransferred && !$isCurrentlyTransferred) {
                // Status changed from pending to transferred
                $this->createCashMutation($fundRelease);

                Log::info('Cash mutation created on update', [
                    'fund_release_id' => $fundRelease->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ]);
            } elseif (!$isNowTransferred && $isCurrentlyTransferred) {
                // Status changed from transferred to pending
                $this->reverseCashMutation($fundRelease);

                Log::info('Cash mutation reversed on update', [
                    'fund_release_id' => $fundRelease->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ]);
            } elseif ($isNowTransferred && $isCurrentlyTransferred) {
                // Already transferred and data changed - UPDATE cash mutation
                $dataChanged = $oldAmount != $fundRelease->total_amount ||
                    $oldFundSourceId != $fundRelease->fund_source_id ||
                    $oldStatus != $newStatus;

                if ($dataChanged) {
                    $this->updateCashMutation($fundRelease);

                    Log::info('Cash mutation updated on data change', [
                        'fund_release_id' => $fundRelease->id,
                        'old_amount' => $oldAmount,
                        'new_amount' => $fundRelease->total_amount,
                        'old_fund_source' => $oldFundSourceId,
                        'new_fund_source' => $fundRelease->fund_source_id,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budget fund release updated successfully',
                'data'    => $fundRelease->fresh([
                    'disbursementHeader',
                    'fundSource',
                    'documents',
                    'items',
                    'cashMutations'
                ])
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Realisasi pencairan tidak ditemukan',
            ], 404);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Update Error', [
                'id'     => $id,
                'error'  => $e->getMessage(),
                'trace'  => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui realisasi pencairan',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $fundRelease = BudgetFundRelease::findOrFail($id);

            // Prevent deletion if already transferred/completed
            // if (in_array($fundRelease->status, ['transferred'])) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Tidak bisa menghapus realisasi pencairan yang sudah ditransfer',
            //     ], 422);
            // }

            // Reverse cash mutation
            if ($fundRelease->cashMutations()->exists()) {
                $this->reverseCashMutation($fundRelease);
            }

            // Delete related items
            BudgetFundReleaseItem::where('budget_fund_release_id', $fundRelease->id)->delete();

            // Delete related files
            BudgetFundReleaseDocument::where('budget_fund_release_id', $fundRelease->id)
                ->each(function ($file) {
                    // Hapus file fisik
                    if (Storage::disk('public')->exists($file->file_path)) {
                        Storage::disk('public')->delete($file->file_path);
                    }
                    $file->delete();
                });

            // Delete header
            $fundRelease->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Realisasi pencairan berhasil dihapus',
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Pencairan tidak ditemukan',
            ], 404);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Delete Error', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus realisasi pencairan',
                'error'   => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    private function storeFiles(Request $request, $fundReleaseId)
    {
        // 1. Hapus semua file yang ada
        BudgetFundReleaseDocument::where('budget_fund_release_id', $fundReleaseId)
            ->each(function ($file) {
                // Hapus file fisik
                if (Storage::disk('public')->exists($file->file_path)) {
                    Storage::disk('public')->delete($file->file_path);
                }
                // Hapus dari database
                $file->delete();
            });

        // 2. Upload file baru jika ada
        if (!$request->hasFile('files')) {
            return;
        }

        foreach ($request->file('files') as $file) {
            $path = $file->store('fund-release-documents', 'public');

            BudgetFundReleaseDocument::create([
                'budget_fund_release_id' => $fundReleaseId,
                'document_name' => $file->getClientOriginalName(),
                'file_name'     => basename($path),
                'file_path'     => $path,
                'file_size'     => $file->getSize(),
                'file_type'     => $file->getMimeType(),
                'uploaded_by'   => Auth::id(),
            ]);
        }
    }

    /**
     * Create cash mutation.
     */
    private function createCashMutation(BudgetFundRelease $fundRelease): void
    {
        $fundSource = FundSource::findOrFail($fundRelease->fund_source_id);

        // Kalkulasi balance
        $currentBalance = $fundSource->balance;
        $newBalance = $currentBalance - $fundRelease->total_amount;

        // Double check balance
        if ($newBalance < 0) {
            throw new \Exception('Insufficient balance after calculation');
        }

        $description = $this->generateCashMutationDescription($fundRelease);

        // Create cash mutation (OUT)
        CashMutation::create([
            'mutation_date'  => $fundRelease->fund_release_date,
            'fund_source_id' => $fundRelease->fund_source_id,
            'type'           => 'out',
            'amount'         => $fundRelease->total_amount,
            'description'    => $description,
            'source_type'    => BudgetFundRelease::class,
            'source_id'      => $fundRelease->id,
            'balance'        => $newBalance,
            'notes'          => $fundRelease->notes,
        ]);

        Log::info('Cash mutation created for fund release', [
            'fund_release_id' => $fundRelease->id,
            'fund_source_id'  => $fundRelease->fund_source_id,
            'amount'          => $fundRelease->total_amount,
            'balance_before'  => $currentBalance,
            'balance_after'   => $newBalance,
        ]);
    }

    /**
     * Reverse cash mutation.
     *
     */
    private function reverseCashMutation(BudgetFundRelease $fundRelease): void
    {
        $deletedCount = CashMutation::where('source_type', BudgetFundRelease::class)
            ->where('source_id', $fundRelease->id)
            ->delete();

        Log::info('Cash mutation reversed for fund release', [
            'fund_release_id' => $fundRelease->id,
            'deleted_count'   => $deletedCount,
        ]);
    }

    /**
     * Update cash mutation.
     */
    private function updateCashMutation(BudgetFundRelease $fundRelease): void
    {
        $this->reverseCashMutation($fundRelease);
        $this->createCashMutation($fundRelease);
    }

    /**
     * Generate description berdsarkan payment type.
     */
    private function generateCashMutationDescription(BudgetFundRelease $fundRelease): string
    {
        $ref = $fundRelease->reference_no ?? $fundRelease->id;
        $name = $fundRelease->recipient_name ?? $fundRelease->recipient_name ?? 'N/A';
        $dept = $fundRelease->recipient_department ?? 'N/A';

        $descriptions = [
            'cash' => "Pencairan Tunai: {$name} - {$dept} (Ref: {$ref})",
            'transfer' => "Transfer ke " .
                ($fundRelease->recipient_bank_name ?? 'N/A') . " - " .
                ($fundRelease->recipient_account_no ?? 'N/A') .
                " (Ref: {$ref})",
        ];


        return $descriptions[$fundRelease->payment_type] ??
            "Pencairan: {$name} - {$dept} (Ref: {$ref}) [" . strtoupper($fundRelease->payment_type) . "]";
    }

    public function approvals($id): JsonResponse
    {
        try {
            // 1. Ambil fundRelease
            $fundRelease = BudgetFundRelease::findOrFail($id);

            // 2. Ambil approvals
            $approvals = BudgetFundReleaseApproval::with([
                'role:id,name',
                'approver:id,name'
            ])
                ->where('budget_fund_release_id', $id)
                ->orderBy('approval_level')
                ->get();

            // 3. Ambil current level dari DB
            $currentLevel = BudgetFundReleaseApproval::where('budget_fund_release_id', $id)
                ->where('is_current', true)
                ->value('approval_level');

            // 4. Format response
            $data = $approvals->map(function ($item) {
                return [
                    'id' => $item->id,
                    'approval_level' => $item->approval_level,
                    'role' => $item->role?->name,
                    'status' => $item->status,
                    'approved_by' => $item->approver?->name,
                    'approved_at' => $item->approved_at,
                    'notes' => $item->notes,
                    'is_current' => $item->is_current,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Approvals retrieved successfully',
                'data' => [
                    'header_status' => $fundRelease->status,
                    'current_level' => $currentLevel,
                    'approvals' => $data
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Get Approvals Error', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get approvals'
            ], 500);
        }
    }

    public function submit($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Lock header
            $header = BudgetFundRelease::lockForUpdate()->findOrFail($id);

            // // Validasi status
            // if ($header->status !== 'draft') {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Only draft can be submitted'
            //     ], 422);
            // }

            $exists = BudgetFundReleaseApproval::where('budget_fund_release_id', $header->id)->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval already generated'
                ], 422);
            }

            // Ambil workflow
            $workflows = ApprovalWorkflow::where('module_name', 'realisasi_pencairan')
                ->orderBy('approval_level')
                ->get();

            if ($workflows->isEmpty()) {
                throw new \Exception('Approval workflow not found');
            }

            // Tentukan level pertama
            $firstLevel = $workflows->min('approval_level');

            // Generate approvals
            $approvals = [];

            foreach ($workflows as $wf) {
                $isFirst = $wf->approval_level == $firstLevel;

                $approvals[] = [
                    'budget_fund_release_id' => $header->id,
                    'approval_level' => $wf->approval_level,
                    'role_id' => $wf->role_id,
                    'status' => $isFirst ? 'pending' : 'waiting',
                    'is_current' => $isFirst,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            BudgetFundReleaseApproval::insert($approvals);

            // Update header
            $header->update([
                'status' => 'submitted'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budget request submitted successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to submit budget fund release', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit budget fund release',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function resubmit($headerId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {

            $header = BudgetFundRelease::lockForUpdate()->findOrFail($headerId);

            /**
             * Validasi status harus returned
             */
            if ($header->status !== 'returned') {
                return response()->json([
                    'success' => false,
                    'message' => 'Budget request is not in returned state'
                ], 422);
            }

            /**
             * Validasi hanya creator yang boleh resubmit (Optional)
             */
            if ($header->created_by !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            validator($request->all())->validate();

            /**
             * Cari approval terakhir yang me-return
             */
            $returnedApproval = BudgetFundReleaseApproval::where(
                'budget_fund_release_id',
                $header->id
            )
                ->where('status', 'returned')
                ->latest('updated_at')
                ->first();

            if (!$returnedApproval) {
                return response()->json([
                    'success' => false,
                    'message' => 'Returned approval not found'
                ], 422);
            }

            /**
             * Pastikan tidak ada current approval aktif
             */
            BudgetFundReleaseApproval::where(
                'budget_fund_release_id',
                $header->id
            )
                ->where('is_current', true)
                ->update([
                    'is_current' => false
                ]);

            /**
             * Aktifkan kembali approver yang meminta revisi
             */
            $returnedApproval->update([
                'status' => 'pending',
                'is_current' => true,
            ]);

            /**
             * Update status header
             */
            $header->update([
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budeget request resubmitted successfully'
            ]);
        } catch (\Throwable $e) {

            DB::rollBack();

            Log::error('Failed to resubmit budget fund release', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to resubmit budget fund release',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function approve($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Lock approval
            $approval = BudgetFundReleaseApproval::lockForUpdate()->findOrFail($approvalId);

            // Validasi hanya step aktif
            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active'
                ], 422);
            }

            // Validasi role
            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Upadate approve, current dan notes
            $approval->update([
                'status' => 'approved',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            // Cari next level
            $nextLevel = BudgetFundReleaseApproval::where('budget_fund_release_id', $approval->budget_fund_release_id)
                ->where('approval_level', '>', $approval->approval_level)
                ->min('approval_level');

            if ($nextLevel) {
                BudgetFundReleaseApproval::where('budget_fund_release_id', $approval->budget_fund_release_id)
                    ->where('approval_level', $nextLevel)
                    ->update([
                        'status' => 'pending',
                        'is_current' => true
                    ]);
            } else {
                BudgetFundRelease::where('id', $approval->budget_fund_release_id)
                    ->update([
                        'status' => 'approved'
                    ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Approved successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Approval Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $approval = BudgetFundReleaseApproval::lockForUpdate()->findOrFail($approvalId);

            // Validasi hanya step aktif
            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active'
                ], 422);
            }

            // Validasi role
            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Update rejected, current dan notes
            $approval->update([
                'status' => 'rejected',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            // Update header jadi rejected
            BudgetFundRelease::where('id', $approval->budget_fund_release_id)
                ->update([
                    'status' => 'rejected'
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rejected successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Reject Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject: ' . $e->getMessage()
            ], 500);
        }
    }

    public function returned($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {

            $approval = BudgetFundReleaseApproval::lockForUpdate()
                ->findOrFail($approvalId);

            /**
             * Validasi approval aktif
             */
            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active'
                ], 422);
            }

            /**
             * Validasi role approver
             */
            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            /**
             * Validasi notes wajib
             */
            if (!$request->filled('notes')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Returned notes is required'
                ], 422);
            }

            /**
             * Update approval menjadi returned
             */
            $approval->update([
                'status' => 'returned',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            /**
             * Update header menjadi need_revision
             */
            BudgetFundRelease::where('id', $approval->budget_fund_release_id)
                ->update([
                    'status' => 'returned'
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Returned successfully'
            ]);
        } catch (\Throwable $e) {

            DB::rollBack();

            Log::error('Budget Request Return Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to return: ' . $e->getMessage()
            ], 500);
        }
    }
}
