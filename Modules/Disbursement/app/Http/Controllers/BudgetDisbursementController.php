<?php

namespace Modules\Disbursement\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalHistory;
use App\Models\ApprovalWorkflow;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\Budget\Models\BudgetRequestActivity;
use Modules\DataMaster\Models\Employee;
use Modules\DataMaster\Models\Vendor;
use Modules\Disbursement\Http\Requests\BudgetDisbursementHeaderRequest;
use Modules\Disbursement\Models\BudgetDisbursementApproval;
use Modules\Disbursement\Models\BudgetDisbursementDocument;
use Modules\Disbursement\Models\BudgetDisbursementHeader;
use Modules\Disbursement\Models\BudgetDisbursementItem;
use Modules\Disbursement\Models\BudgetDisbursementRecipient;

class BudgetDisbursementController extends BaseApiController
{
    protected $searchableColumns = ['disbursement_no', 'disburse_date'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['disbursement_no', 'disburse_date'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new BudgetDisbursementHeader());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with([
                'requestHeader:id,request_no,request_date,notes,unit_id',
                'requestHeader.unit:id,unit_name',
                'requestActivity:id,description',
                'items'
            ])
            ->withSum(['fundReleases as fund_releases_sum_total_amount' => function ($query) {
                $query->whereNotIn('status', ['rejected']);
            }], 'total_amount')
            ->orderBy('disbursement_no');

        // Filter status disbursement
        if ($request->filled('status')) {
            $statuses = $request->status;

            if (is_array($statuses)) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $statuses);
            }
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
        $formRequest = app(BudgetDisbursementHeaderRequest::class);
        validator($request->all(), $formRequest->rules())->validate();

        try {
            $header = DB::transaction(function () use ($request) {

                // Validasi budget request header jika diperlukan
                if ($request->has('budget_request_header_id') && $request->has('budget_request_activity_id')) {
                    $activity = BudgetRequestActivity::lockForUpdate()
                        ->findOrFail($request->budget_request_activity_id);

                    if ($activity->budget_request_header_id != $request->budget_request_header_id) {
                        throw new \Exception('Invalid Budget Request Header Id');
                    }

                    // Validasi budget dari BudgetRequestActivity
                    if (!$activity->hasAvailableBudget($request->total_amount)) {
                        throw new \Exception('Nilai anggaran sudah melewati. Sisa: ' . $activity->remaining_amount);
                    }
                }

                $header = BudgetDisbursementHeader::create([
                    'disbursement_no'            => $request->disbursement_no,
                    'disbursement_date'          => $request->disbursement_date,
                    'budget_request_header_id'   => $request->budget_request_header_id,
                    'budget_request_activity_id' => $request->budget_request_activity_id,
                    'total_amount'               => $request->total_amount,
                    'notes'                      => $request->notes,
                    'status'                     => 'draft',
                    'created_by'                 => Auth::id(),
                    'updated_by'                 => Auth::id(),
                ]);

                // Simpan items beserta recipients-nya
                $this->storeItemsWithRecipients($header->id, $this->parseItems($request->items));

                return $header;
            }, 3);

            // Simpan documents
            $this->storeFiles($request, $header->id);

            return response()->json([
                'success' => true,
                'message' => 'Budget disbursement created successfully',
                'data'    => $header->load(['items', 'items.requestItem', 'items.recipients'])
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Store Error', ['error' => $e]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create budget disbursement: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $formRequest = app(BudgetDisbursementHeaderRequest::class);
        $validated = validator($request->all(), $formRequest->rules())->validate();

        try {
            $header = DB::transaction(function () use ($request, $id) {
                $header = BudgetDisbursementHeader::lockForUpdate()->findOrFail($id);

                if (in_array($header->status, ['approved', 'rejected'])) {
                    throw new \Exception('Cannot update finalized disbursement');
                }

                if (
                    $request->has('budget_request_activity_id') &&
                    $request->budget_request_activity_id != $header->budget_request_activity_id
                ) {
                    $activity = BudgetRequestActivity::lockForUpdate()
                        ->findOrFail($request->budget_request_activity_id);

                    if ($activity->budget_request_header_id != $request->budget_request_header_id) {
                        throw new \Exception('Invalid Budget Request Header Id');
                    }
                }

                $newTotal = $request->total_amount;

                $header->update([
                    'disbursement_no'            => $request->disbursement_no,
                    'disbursement_date'          => $request->disbursement_date,
                    'budget_request_header_id'   => $request->budget_request_header_id,
                    'budget_request_activity_id' => $request->budget_request_activity_id,
                    'total_amount'               => $newTotal,
                    'notes'                      => $request->notes,
                    'updated_by'                 => Auth::id(),
                ]);

                // Sync items beserta recipients-nya
                $this->syncItemsWithRecipients($header->id, $this->parseItems($request->items));

                return $header;
            }, 3);

            $this->storeFiles($request, $header->id);

            return response()->json([
                'success' => true,
                'message' => 'Budget disbursement updated',
                'data'    => $header->load(['items', 'items.requestItem', 'documents'])
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Update Error', ['error' => $e]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() === 'Budget Exceeded'
                    ? 'Budget exceeded'
                    : 'Failed to update',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $disbursementHeader = BudgetDisbursementHeader::with([
            'requestHeader',
            'requestHeader.unit:id,unit_name',
            'requestHeader.fiscalYear:id,year',
            'requestHeader.academicPeriod:id,academic_year,semester',
            'requestHeader.budgetCategory:id,name',
            'requestHeader.subBudgetCategory:id,name',

            'requestActivity' => function ($query) {
                $query->select('id', 'activity_id', 'description', 'budget_request_header_id', 'total_amount', 'start_date', 'end_date', 'output_indicator')
                    ->withSum([
                        'disbursements' => function ($qDisb) {
                            $qDisb->whereNotIn('status', ['rejected']);
                        }
                    ], 'total_amount')
                    ->with([
                        'activity:id,activity_code,activity_name',
                        'requestItems' => function ($qItems) {
                            $qItems->with([
                                'activityItem' => function ($qItem3) {
                                    $qItem3->select('id', 'item_code', 'item_name', 'trans_type_id')
                                        ->with(['transType:id,code,name,group_code']);
                                },
                                'unitMeasure:id,name',
                                'multipliers:id,budget_request_item_id,sequence,label,value'
                            ])->withSum('disbursementItems', 'total_amount');
                        }
                    ]);
            },

            'items.requestItem',
            'items.recipients',
            'documents'
        ])
            ->with([
                'items' => function ($query) {
                    $query->withSum(['fundReleaseItems' => function ($qRelease) {
                        $qRelease->whereHas('fundRelease', function ($qHeader) {
                            $qHeader->whereNotIn('status', ['rejected']);
                        });
                    }], 'total_amount');
                }
            ])
            ->withSum(['fundReleases as fund_releases_sum_total_amount' => function ($query) {
                $query->whereNotIn('status', ['rejected']);
            }], 'total_amount')
            ->findOrFail($id);


        $disbursement = $disbursementHeader->toArray();
        $existingItemIds = $disbursementHeader->items->pluck('budget_request_item_id')->toArray();

        $activity = $disbursementHeader->requestActivity;

        $availableItems = [];
        $activitySummary = null;

        if ($activity) {
            // Map available items langsung menggunakan data yang sudah ada di memori
            $availableItems = $activity->requestItems->map(function ($item) use ($existingItemIds) {
                $totalAmount = floatval($item->total_amount);
                $disbursedAmount = floatval($item->disbursement_items_sum_total_amount ?? 0);
                $remainingAmount = $totalAmount - $disbursedAmount;

                return [
                    'id' => $item->id,
                    'description' => $item->description,
                    'activity_item_id' => $item->activity_item_id,
                    'volume' => $item->volume,
                    'unit_measure_id' => $item->unit_measure_id,
                    'unit_price' => $item->unit_price,
                    'multipliers' => $item->multipliers,
                    'total_amount' => $totalAmount,
                    'disbursed_amount' => $disbursedAmount,
                    'remaining_amount' => $remainingAmount,
                    'trans_type_code' => $item->activityItem->transType->code ?? '',
                    'trans_type_group' => $item->activityItem->transType->group_code ?? 'OTHER',
                    'unit_measure' => $item->unitMeasure,
                    'activity_item' => $item->activityItem,
                    'already_selected' => in_array($item->id, $existingItemIds),
                    'can_be_selected' => $remainingAmount > 0,
                ];
            });

            // Set summary tanpa memicu lazy loading ataupun query ulang
            $activitySummary = [
                'total_amount' => $activity->total_amount,
                'total_disbursed' => $activity->total_disbursed_amount,
                'remaining_amount' => $activity->remaining_amount,
                'can_add_disbursement' => $activity->remaining_amount > 0,
            ];
        }

        // Kumpulkan semua recipients dari semua items
        $allRecipients = collect();
        foreach ($disbursementHeader->items as $item) {
            foreach ($item->recipients as $recipient) {
                $allRecipients->push($recipient);
            }
        }

        $recipientsSummary = [
            'total_recipients' => $allRecipients->count(),
            'total_recipient_amount' => $allRecipients->sum('amount'),
            'recipients' => $allRecipients->map(function ($recipient) {
                return [
                    'id' => $recipient->id,
                    'recipient_type' => $recipient->recipient_type,
                    'recipient_id' => $recipient->recipient_id,
                    'recipient_name' => $recipient->recipient_name,
                    'identity_no' => $recipient->identity_no,
                    'bank_name' => $recipient->bank_name,
                    'bank_account_no' => $recipient->bank_account_no,
                    'bank_account_name' => $recipient->bank_account_name,
                    'amount' => $recipient->amount,
                    'notes' => $recipient->notes,
                ];
            })
        ];

        $disbursement['available_items'] = $availableItems;
        $disbursement['activity_summary'] = $activitySummary;
        $disbursement['recipients_summary'] = $recipientsSummary;

        return response()->json([
            'success' => true,
            'data' => $disbursement
        ]);
    }

    public function destroy($id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $disbursementHeader = BudgetDisbursementHeader::findOrFail($id);

            // Validasi status, hanya draft yang bisa diupdate
            if (in_array(strtolower($disbursementHeader->status), ['approved'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak bisa menghapus realisasi pencairan yang sudah disetujui. Status sekarang: ' . $disbursementHeader->status
                ], 422);
            }

            // Delete ApprovalHistory
            ApprovalHistory::where('approvable_type', BudgetDisbursementHeader::class)->where('approvable_id', $disbursementHeader->id)->delete();

            // Delete related files
            BudgetDisbursementDocument::where('budget_disbursement_header_id', $disbursementHeader->id)
                ->each(function ($file) {
                    // Hapus file fisik
                    if (Storage::disk('public')->exists($file->file_path)) {
                        Storage::disk('public')->delete($file->file_path);
                    }
                    $file->delete();
                });

            // Delete header
            $disbursementHeader->delete();

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

    private function storeFiles(Request $request, $headerId)
    {
        // 1. AMBIL ARRAY ID YANG DIPERTAHANKAN DARI EXISTING
        $keepDocumentIds = $request->input('keep_files', []);
        $keepDocumentIds = array_map('intval', $keepDocumentIds);

        // 2. PROSES UPLOAD FILE BARU
        if ($request->hasFile('new_files')) {
            $uploadedFiles = $request->file('new_files');

            foreach ($uploadedFiles as $uploadedFile) {
                if ($uploadedFile->isValid()) {
                    $path = $uploadedFile->store('disbursement-documents', 'public');

                    $newDoc = BudgetDisbursementDocument::create([
                        'budget_disbursement_header_id' => $headerId,
                        'document_name' => $uploadedFile->getClientOriginalName(),
                        'file_name'     => basename($path),
                        'file_path'     => $path,
                        'file_size'     => $uploadedFile->getSize(),
                        'file_type'     => $uploadedFile->getMimeType(),
                        'uploaded_by'   => Auth::id(),
                    ]);

                    // Masukkan ID baru ke array agar tidak ikut terhapus di langkah ke-3
                    $keepDocumentIds[] = $newDoc->id;
                }
            }
        }

        // 3. PROSES HAPUS DATA YANG TIDAK DIKIRIM
        $query = BudgetDisbursementDocument::where('budget_disbursement_header_id', $headerId);

        if (!empty($keepDocumentIds)) {
            $query->whereNotIn('id', $keepDocumentIds);
        }

        // Ambil dokumen yang harus dihapus
        $deletedDocuments = $query->get();

        foreach ($deletedDocuments as $document) {
            // Hapus file fisik dari storage
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            // Hapus data dari database
            $document->delete();
        }
    }
    
    public function approvals($id): JsonResponse
    {
        try {
            $header = BudgetDisbursementHeader::findOrFail($id);

            $approvals = BudgetDisbursementApproval::with(['role:id,name', 'approver:id,name'])
                ->where('budget_disbursement_header_id', $id)
                ->orderBy('approval_level')
                ->get();

            $currentLevel = $approvals->where('is_current', true)->first()?->approval_level;

            return response()->json([
                'success' => true,
                'message' => 'Approvals retrieved successfully',
                'data' => [
                    'header_status' => $header->status,
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
            Log::error('Get Approvals Error', [
                'id'      => $id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get approvals'
            ], 500);
        }
    }

    public function approvalHistory(BudgetDisbursementHeader $disbursement): JsonResponse
    {
        $history = ApprovalHistory::where('approvable_type', BudgetDisbursementHeader::class)
            ->where('approvable_id', $disbursement->id)
            ->orderBy('sequence', 'asc')
            ->get([
                'id',
                'user_name',
                'user_role',
                'from_status',
                'to_status',
                'notes',
                'action_at'
            ]);

        return response()->json([
            'data' => $history
        ]);
    }

    public function submit($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Lock header
            $header = BudgetDisbursementHeader::lockForUpdate()->findOrFail($id);

            // Validasi status
            if ($header->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft can be submitted'
                ], 422);
            }

            $exists = BudgetDisbursementApproval::where('budget_disbursement_header_id', $header->id)->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval already generated'
                ], 422);
            }

            // Ambil workflow berdasarkan header approval workflow milik unit dari request header
            $approvalHeader = $header->requestHeader?->unit?->approvalWorkflowHeader;

            $workflow = ApprovalWorkflow::with('steps')
                ->where('approval_workflow_header_id', $approvalHeader?->id)
                ->where('module_name', 'pengajuan_pencairan')
                ->first();

            if (!$workflow || $workflow->steps->isEmpty()) {
                throw new \Exception('Alur persetujuan belum diatur untuk unit: ' . ($header->requestHeader?->unit?->unit_name ?? 'unknown'));
            }

            $steps = $workflow->steps->sortBy('approval_level')->values();

            // Tentukan level pertama
            $firstLevel = $steps->min('approval_level');

            // Generate approvals
            $approvals = [];

            foreach ($steps as $step) {
                $isFirst = $step->approval_level == $firstLevel;

                $approvals[] = [
                    'budget_disbursement_header_id' => $header->id,
                    'approval_level' => $step->approval_level,
                    'role_id' => $step->role_id,
                    'status' => $isFirst ? 'pending' : 'waiting',
                    'is_current' => $isFirst,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            BudgetDisbursementApproval::insert($approvals);

            // Update header
            $header->update([
                'status' => 'submitted'
            ]);

            $header->recordApproval('submit', 'draft', 'submitted');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budget request submitted successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to submit budget request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit budget request',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function resubmit($headerId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $header = BudgetDisbursementHeader::lockForUpdate()->findOrFail($headerId);

            // Validasi status harus returned
            if ($header->status !== 'returned') {
                return response()->json([
                    'success' => false,
                    'message' => 'Budget request is not in returned state'
                ], 422);
            }

            // Validasi hanya creator yang boleh resubmit
            if ($header->created_by !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            validator($request->all())->validate();

            // Cari approval terakhir yang me-return
            $returnedApproval = BudgetDisbursementApproval::where(
                'budget_disbursement_header_id',
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

            // Pastikan tidak ada current approval aktif
            BudgetDisbursementApproval::where(
                'budget_disbursement_header_id',
                $header->id
            )
                ->where('is_current', true)
                ->update([
                    'is_current' => false
                ]);

            // Aktifkan kembali approver yang meminta revisi
            $returnedApproval->update([
                'status' => 'pending',
                'is_current' => true,
            ]);

            // Update status header
            $header->update([
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            $header->recordApproval('revise', 'returned', 'submitted');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budget request resubmitted successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Failed to resubmit budget request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to resubmit budget request',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function approve($approvalId, Request $request): JsonResponse
    {
        try {
            DB::transaction(function () use ($approvalId, $request) {
                // Lock approval
                $approval = BudgetDisbursementApproval::lockForUpdate()
                    ->with('role')
                    ->findOrFail($approvalId);

                // Lock header
                $header = BudgetDisbursementHeader::lockForUpdate()
                    ->findOrFail($approval->budget_disbursement_header_id);

                // Validasi step aktif
                if (!$approval->is_current || $approval->status !== 'pending') {
                    throw new \Exception('This approval is not active');
                }

                // Validasi role
                if (!Auth::user()->hasRole($approval->role->name)) {
                    throw new \Exception('Unauthorized');
                }

                // Approve current step
                $approval->update([
                    'status' => 'approved',
                    'is_current' => false,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'notes' => $request->notes,
                ]);

                // Cari next level
                $nextApproval = BudgetDisbursementApproval::where('budget_disbursement_header_id', $approval->budget_disbursement_header_id)
                    ->where('approval_level', '>', $approval->approval_level)
                    ->orderBy('approval_level')
                    ->lockForUpdate()
                    ->first();

                $newStatus = $nextApproval ? 'verified' : 'approved';

                if ($nextApproval) {
                    $nextApproval->update([
                        'status' => 'pending',
                        'is_current' => true
                    ]);
                }


                $header->recordApproval('approve', $header->status, $newStatus, $approval->notes);
                $header->update([
                    'status' => $newStatus
                ]);

            }, 3);

            return response()->json([
                'success' => true,
                'message' => 'Approved successfully'
            ]);
        } catch (\Throwable $e) {
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
        try {
            DB::transaction(function () use ($approvalId, $request) {
                // Lock approval
                $approval = BudgetDisbursementApproval::lockForUpdate()
                    ->with('role')
                    ->findOrFail($approvalId);

                // Lock header
                $header = BudgetDisbursementHeader::lockForUpdate()
                    ->findOrFail($approval->budget_disbursement_header_id);

                // Lock activity (buat rollback budget)
                $activity = BudgetRequestActivity::lockForUpdate()
                    ->findOrFail($header->budget_request_activity_id);

                // Validasi step aktif
                if (!$approval->is_current || $approval->status !== 'pending') {
                    throw new \Exception('This approval is not active');
                }

                // Validasi role
                if (!Auth::user()->hasRole($approval->role->name)) {
                    throw new \Exception('Unauthorized');
                }

                // // Validasi header sudah final
                // if (in_array($header->status, ['approved', 'paid'])) {
                //     throw new \Exception('Cannot reject finalized disbursement');
                // }

                // Update approval
                $approval->update([
                    'status' => 'rejected',
                    'is_current' => false,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'notes' => $request->notes,
                ]);

                $header->recordApproval('reject', $header->status, 'rejected');

                // Update header
                $header->update([
                    'status' => 'rejected'
                ]);
                

                // Rollback nilai used_amount
                $activity->decrement('used_amount', $header->total_amount);
            }, 3);

            return response()->json([
                'success' => true,
                'message' => 'Rejected successfully'
            ]);
        } catch (\Throwable $e) {
            Log::error('Reject Error', [
                'approval_id' => $approvalId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage() === 'This approval is not active'
                    ? $e->getMessage()
                    : 'Failed to reject'
            ], 500);
        }
    }

    public function returned($approvalId, Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $approval = BudgetDisbursementApproval::lockForUpdate()
                ->findOrFail($approvalId);

            // Validasi approval aktif
            if (!$approval->is_current || $approval->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This approval is not active'
                ], 422);
            }

            // Validasi role approver
            if (!Auth::user()->hasRole($approval->role->name)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Validasi notes wajib
            if (!$request->filled('notes')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Returned notes is required'
                ], 422);
            }

            // Update approval menjadi returned
            $approval->update([
                'status' => 'returned',
                'is_current' => false,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            $header = BudgetDisbursementHeader::where('id', $approval->budget_disbursement_header_id);

            $header->recordApproval('reject', $header->status, 'returned');

            // Update header menjadi need_revision
            $header->update([
                'status' => 'returned'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Returned successfully'
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('Budget Disbursement Return Error', [
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

    // Method untuk parsing items
    private function parseItems($items): array
    {
        if (is_string($items)) {
            return json_decode($items, true) ?: [];
        }

        return is_array($items) ? $items : [];
    }

    /**
     * Store items beserta recipients dari setiap item
     * SEKARANG: recipients disimpan dengan budget_disbursement_item_id
     */
    private function storeItemsWithRecipients($headerId, array $items): void
    {
        $itemsToInsert = [];
        $recipientsByItem = [];

        foreach ($items as $index => $item) {
            if (!isset($item['budget_request_item_id'])) {
                continue;
            }

            $itemsToInsert[] = [
                'budget_disbursement_header_id' => $headerId,
                'budget_request_item_id'        => $item['budget_request_item_id'],
                'total_amount'                  => $item['total_amount'] ?? $item['disbursed_amount'] ?? 0,
                'notes'                         => $item['notes'] ?? null,
                'created_at'                    => now(),
                'updated_at'                    => now(),
            ];

            // Simpan recipients untuk item ini (akan diproses setelah insert)
            if (isset($item['recipients']) && is_array($item['recipients']) && count($item['recipients']) > 0) {
                $recipientsByItem[$index] = $item['recipients'];
            }
        }

        if (!empty($itemsToInsert)) {
            BudgetDisbursementItem::insert($itemsToInsert);

            // Ambil items yang baru saja di-insert
            $insertedItems = BudgetDisbursementItem::where('budget_disbursement_header_id', $headerId)
                ->orderBy('id')
                ->get();

            // Simpan recipients untuk setiap item dengan budget_disbursement_item_id
            $itemIndex = 0;
            foreach ($insertedItems as $insertedItem) {
                // Cari recipients yang sesuai dengan index ini
                $recipients = $recipientsByItem[$itemIndex] ?? null;
                if ($recipients) {
                    $this->storeRecipientsForItem($insertedItem->id, $recipients);
                }
                $itemIndex++;
            }
        }
    }

    /**
     * Sync items beserta recipients dari setiap item
     * SEKARANG: recipients disimpan dengan budget_disbursement_item_id
     */
    private function syncItemsWithRecipients($headerId, array $items): void
    {
        $existingIds = BudgetDisbursementItem::where('budget_disbursement_header_id', $headerId)
            ->pluck('id')
            ->toArray();

        $incomingIds = [];

        foreach ($items as $item) {
            if (isset($item['id'])) {
                // Update existing item
                $incomingIds[] = $item['id'];
                BudgetDisbursementItem::where('id', $item['id'])
                    ->where('budget_disbursement_header_id', $headerId)
                    ->update([
                        'total_amount' => $item['total_amount'] ?? ($item['disbursed_amount'] ?? 0),
                        'notes'        => $item['notes'] ?? null,
                        'updated_at'   => now(),
                    ]);

                // Sync recipients untuk item ini (berdasarkan budget_disbursement_item_id)
                if (isset($item['recipients']) && is_array($item['recipients'])) {
                    $this->syncRecipientsForItem($item['id'], $item['recipients']);
                } else {
                    // Hapus semua recipients untuk item ini jika tidak ada recipients yang dikirim
                    BudgetDisbursementRecipient::where('budget_disbursement_item_id', $item['id'])->delete();
                }
            } else {
                // Create new item
                $newItem = BudgetDisbursementItem::create([
                    'budget_disbursement_header_id' => $headerId,
                    'budget_request_item_id'        => $item['budget_request_item_id'],
                    'total_amount'                  => $item['total_amount'] ?? ($item['disbursed_amount'] ?? 0),
                    'notes'                         => $item['notes'] ?? null,
                ]);
                $incomingIds[] = $newItem->id;

                // Store recipients untuk item baru dengan budget_disbursement_item_id
                if (isset($item['recipients']) && is_array($item['recipients'])) {
                    $this->storeRecipientsForItem($newItem->id, $item['recipients']);
                }
            }
        }

        // Delete items that are not in the incoming list
        $deletedIds = array_diff($existingIds, $incomingIds);
        if (!empty($deletedIds)) {
            // Delete recipients terkait terlebih dahulu (berdasarkan budget_disbursement_item_id)
            BudgetDisbursementRecipient::whereIn('budget_disbursement_item_id', $deletedIds)->delete();
            // Delete items
            BudgetDisbursementItem::whereIn('id', $deletedIds)->delete();
        }
    }

    /**
     * Store recipients untuk sebuah item
     * SEKARANG: menggunakan budget_disbursement_item_id (bukan header_id)
     */
    private function storeRecipientsForItem($budgetDisbursementItemId, $recipients)
    {
        if (empty($recipients) || !is_array($recipients)) {
            return;
        }

        $recipientsToInsert = [];

        foreach ($recipients as $recipient) {
            $recipientType = null;
            $recipientId = $recipient['recipient_id'] ?? null;

            // Determine recipient_type based on input
            if (isset($recipient['recipient_type'])) {
                if ($recipient['recipient_type'] === 'employee' || $recipient['recipient_type'] === 'Modules\\DataMaster\\Models\\Employee') {
                    $recipientType = Employee::class;
                } elseif ($recipient['recipient_type'] === 'vendor' || $recipient['recipient_type'] === 'Modules\\DataMaster\\Models\\Vendor') {
                    $recipientType = Vendor::class;
                } else {
                    $recipientType = $recipient['recipient_type'];
                }
            } elseif ($recipientId) {
                // Auto-detect by checking existence
                if (Employee::where('id', $recipientId)->exists()) {
                    $recipientType = Employee::class;
                } elseif (Vendor::where('id', $recipientId)->exists()) {
                    $recipientType = Vendor::class;
                }
            }

            $recipientsToInsert[] = [
                'budget_disbursement_item_id'   => $budgetDisbursementItemId,
                'recipient_type'                => $recipientType,
                'recipient_id'                  => $recipientId,
                'recipient_name'                => $recipient['recipient_name'] ?? '',
                'identity_no'                   => $recipient['identity_no'] ?? null,
                'bank_name'                     => $recipient['bank_name'] ?? null,
                'bank_account_no'               => $recipient['bank_account_no'] ?? null,
                'bank_account_name'             => $recipient['bank_account_name'] ?? null,
                'amount'                        => $recipient['amount'] ?? 0,
                'notes'                         => $recipient['notes'] ?? null,
                'created_at'                    => now(),
                'updated_at'                    => now(),
            ];
        }

        if (!empty($recipientsToInsert)) {
            BudgetDisbursementRecipient::insert($recipientsToInsert);
        }
    }

    /**
     * Sync recipients untuk sebuah item (create, update, delete)
     * SEKARANG: menggunakan budget_disbursement_item_id (bukan header_id)
     */
    private function syncRecipientsForItem($budgetDisbursementItemId, $recipients)
    {
        if (!is_array($recipients)) {
            return;
        }

        // Get existing recipient IDs for this item
        $existingRecipientIds = BudgetDisbursementRecipient::where('budget_disbursement_item_id', $budgetDisbursementItemId)
            ->pluck('id')
            ->toArray();

        $incomingRecipientIds = [];
        $recipientsToUpdate = [];
        $recipientsToInsert = [];

        foreach ($recipients as $recipient) {
            // Determine recipient_type
            $recipientType = null;
            $recipientId = $recipient['recipient_id'] ?? null;

            if (isset($recipient['recipient_type'])) {
                if ($recipient['recipient_type'] === 'employee' || $recipient['recipient_type'] === 'Modules\\DataMaster\\Models\\Employee') {
                    $recipientType = Employee::class;
                } elseif ($recipient['recipient_type'] === 'vendor' || $recipient['recipient_type'] === 'Modules\\DataMaster\\Models\\Vendor') {
                    $recipientType = Vendor::class;
                } else {
                    $recipientType = $recipient['recipient_type'];
                }
            } elseif ($recipientId) {
                if (Employee::where('id', $recipientId)->exists()) {
                    $recipientType = Employee::class;
                } elseif (Vendor::where('id', $recipientId)->exists()) {
                    $recipientType = Vendor::class;
                }
            }

            $recipientData = [
                'recipient_type'        => $recipientType,
                'recipient_id'          => $recipientId,
                'recipient_name'        => $recipient['recipient_name'] ?? '',
                'identity_no'           => $recipient['identity_no'] ?? null,
                'bank_name'             => $recipient['bank_name'] ?? null,
                'bank_account_no'       => $recipient['bank_account_no'] ?? null,
                'bank_account_name'     => $recipient['bank_account_name'] ?? null,
                'amount'                => $recipient['amount'] ?? 0,
                'notes'                 => $recipient['notes'] ?? null,
                'updated_at'            => now(),
            ];

            if (isset($recipient['id']) && !empty($recipient['id'])) {
                // Update existing recipient
                $recipientsToUpdate[$recipient['id']] = $recipientData;
                $incomingRecipientIds[] = $recipient['id'];
            } else {
                // Create new recipient
                $recipientData['budget_disbursement_item_id'] = $budgetDisbursementItemId;
                $recipientData['created_at'] = now();
                $recipientsToInsert[] = $recipientData;
            }
        }

        // Process updates
        foreach ($recipientsToUpdate as $id => $data) {
            BudgetDisbursementRecipient::where('id', $id)->update($data);
        }

        // Process inserts
        if (!empty($recipientsToInsert)) {
            BudgetDisbursementRecipient::insert($recipientsToInsert);
            // Get newly inserted IDs
            $newRecipients = BudgetDisbursementRecipient::where('budget_disbursement_item_id', $budgetDisbursementItemId)
                ->whereIn('recipient_name', array_column($recipientsToInsert, 'recipient_name'))
                ->get();
            foreach ($newRecipients as $newRecipient) {
                $incomingRecipientIds[] = $newRecipient->id;
            }
        }

        // Delete recipients not in the incoming list
        $toDelete = array_diff($existingRecipientIds, $incomingRecipientIds);
        if (!empty($toDelete)) {
            BudgetDisbursementRecipient::whereIn('id', $toDelete)->delete();
        }
    }

    /**
     * Overwrite applyFilters
     */
    protected function applyFilters($query, Request $request): void
    {
        parent::applyFilters($query, $request);

        $user = Auth::user();
        $filters = $request->input('filter', []);

        // Cek apakah context dikirim dalam filter
        if (isset($filters['context']) && !empty($filters['context'])) {
            $context = $filters['context'];

            if ($context === 'input') {
                if (!$user->hasRole('Administrator')) {
                    $query->where('unit_id', $user->unit_id);
                }
            } elseif ($context === 'approval') {
                // Context approval: hanya filter unit_id jika TIDAK PUNYA permission
                if (!$user->hasPermissionTo('approve pengajuan_pencairan')) {
                    $query->where('unit_id', $user->unit_id);
                }
            } else {
                $query->where('unit_id', $user->unit_id);
            }
        }
    }
}
