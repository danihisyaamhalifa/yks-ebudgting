<?php

namespace Modules\Disbursement\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\Disbursement\Http\Requests\BudgetAccountabilityRequest;
use Modules\Disbursement\Models\BudgetAccountability;
use Modules\Disbursement\Models\BudgetAccountabilityApproval;
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

        if ($request->filled('status')) {
            $statuses = $request->status;
            if (is_array($statuses)) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $statuses);
            }
        }

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
                'status' => 'draft',
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
                'fundRelease' => function ($query) {
                    $query->with([
                        'fundSource:id,name,code',
                        'disbursementHeader' => function ($q) {
                            $q->with([
                                'requestHeader' => function ($rq) {
                                    $rq->with(['unit:id,unit_name,unit_type']);
                                },
                            ]);
                        },
                    ]);
                },
                'fundReleaseItem',
                'items',
                'returns.fundSource',
                'documents',
                'approvals.role:id,name',
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
     * Get the approval steps for a given accountability.
     */
    public function approvals($id): JsonResponse
    {
        try {
            $accountability = BudgetAccountability::findOrFail($id);

            $approvals = BudgetAccountabilityApproval::with(['role:id,name', 'approver:id,name'])
                ->where('budget_accountability_id', $id)
                ->orderBy('approval_level')
                ->get();

            $currentLevel = $approvals->where('is_current', true)->first()?->approval_level;

            return response()->json([
                'success' => true,
                'message' => 'Approvals retrieved successfully',
                'data' => [
                    'header_status' => $accountability->status,
                    'current_level' => $currentLevel,
                    'approvals' => $approvals->map(fn($item) => [
                        'id'             => $item->id,
                        'approval_level' => $item->approval_level,
                        'role'           => $item->role?->name,
                        'status'         => $item->status,
                        'approved_by'    => $item->approver?->name,
                        'approved_at'    => $item->approved_at,
                        'notes'          => $item->notes,
                        'is_current'     => $item->is_current,
                    ]),
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Get Accountability Approvals Error', [
                'id'      => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get approvals',
            ], 500);
        }
    }

    /**
     * Submit an accountability for approval, generating its approval steps.
     */
    public function submit($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $accountability = BudgetAccountability::lockForUpdate()->findOrFail($id);

            if ($accountability->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft can be submitted',
                ], 422);
            }

            $exists = BudgetAccountabilityApproval::where('budget_accountability_id', $accountability->id)->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval already generated',
                ], 422);
            }

            $this->generateApprovals($accountability);

            $accountability->update([
                'status' => 'submitted',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pertanggungjawaban submitted successfully',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to submit pertanggungjawaban', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit pertanggungjawaban: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resubmit a returned accountability for approval.
     */
    public function resubmit($id, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $accountability = BudgetAccountability::lockForUpdate()->findOrFail($id);

            if ($accountability->status !== 'returned') {
                return response()->json([
                    'success' => false,
                    'message' => 'Pertanggungjawaban is not in returned state',
                ], 422);
            }

            $returnedApproval = BudgetAccountabilityApproval::where('budget_accountability_id', $accountability->id)
                ->where('status', 'returned')
                ->latest('updated_at')
                ->first();

            if (!$returnedApproval) {
                return response()->json([
                    'success' => false,
                    'message' => 'Returned approval not found',
                ], 422);
            }

            BudgetAccountabilityApproval::where('budget_accountability_id', $accountability->id)
                ->where('is_current', true)
                ->update(['is_current' => false]);

            $returnedApproval->update([
                'status' => 'pending',
                'is_current' => true,
            ]);

            $accountability->update([
                'status' => 'submitted',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pertanggungjawaban resubmitted successfully',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to resubmit pertanggungjawaban', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to resubmit pertanggungjawaban: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve the current approval step for an accountability.
     */
    public function approve($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $approval = BudgetAccountabilityApproval::lockForUpdate()
                ->with('role')
                ->findOrFail($approvalId);

            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active',
                ], 422);
            }

            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $approval->update([
                'status' => 'approved',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            $nextLevel = BudgetAccountabilityApproval::where('budget_accountability_id', $approval->budget_accountability_id)
                ->where('approval_level', '>', $approval->approval_level)
                ->min('approval_level');

            $headerStatus = 'approved';

            if ($nextLevel) {
                BudgetAccountabilityApproval::where('budget_accountability_id', $approval->budget_accountability_id)
                    ->where('approval_level', $nextLevel)
                    ->update([
                        'status' => 'pending',
                        'is_current' => true,
                    ]);

                $headerStatus = 'verified';
            }

            $accountability = BudgetAccountability::find($approval->budget_accountability_id);
            if ($accountability) {
                $accountability->update([
                    'status' => $headerStatus,
                ]);
            }

            $currentLevel = BudgetAccountabilityApproval::where('budget_accountability_id', $approval->budget_accountability_id)
                ->where('is_current', true)
                ->value('approval_level');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Approved successfully',
                'data' => [
                    'current_level' => $currentLevel,
                    'header_status' => $headerStatus,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Accountability Approval Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject the current approval step for an accountability.
     */
    public function reject($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $approval = BudgetAccountabilityApproval::lockForUpdate()
                ->with('role')
                ->findOrFail($approvalId);

            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active',
                ], 422);
            }

            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $approval->update([
                'status' => 'rejected',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            $accountability = BudgetAccountability::find($approval->budget_accountability_id);
            if ($accountability) {
                $accountability->update([
                    'status' => 'rejected',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rejected successfully',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Accountability Reject Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Return the current approval step for an accountability (needs revision).
     */
    public function returned($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $approval = BudgetAccountabilityApproval::lockForUpdate()
                ->with('role')
                ->findOrFail($approvalId);

            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active',
                ], 422);
            }

            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            if (!$request->filled('notes')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Returned notes is required',
                ], 422);
            }

            $approval->update([
                'status' => 'returned',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            $accountability = BudgetAccountability::find($approval->budget_accountability_id);
            if ($accountability) {
                $accountability->update([
                    'status' => 'returned',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Returned successfully',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Accountability Return Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to return: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate approval steps for an accountability based on the configured workflow.
     */
    private function generateApprovals(BudgetAccountability $accountability): void
    {
        $unit = $accountability->fundRelease
            ?->disbursementHeader
            ?->requestHeader
            ?->unit;

        $approvalHeader = $unit?->approvalWorkflowHeader;

        $workflow = ApprovalWorkflow::with('steps')
            ->where('approval_workflow_header_id', $approvalHeader?->id)
            ->where('module_name', 'pertanggungjawaban_anggaran')
            ->first();

        if (!$workflow || $workflow->steps->isEmpty()) {
            throw new \Exception('Alur persetujuan belum diatur untuk unit: ' . ($unit?->unit_name ?? 'unknown'));
        }

        $steps = $workflow->steps->sortBy('approval_level')->values();
        $firstLevel = $steps->min('approval_level');

        $approvals = [];

        foreach ($steps as $step) {
            $isFirst = $step->approval_level == $firstLevel;

            $approvals[] = [
                'budget_accountability_id' => $accountability->id,
                'approval_level' => $step->approval_level,
                'role_id' => $step->role_id,
                'status' => $isFirst ? 'pending' : 'waiting',
                'is_current' => $isFirst,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        BudgetAccountabilityApproval::insert($approvals);
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