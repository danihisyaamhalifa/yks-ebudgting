<?php

namespace Modules\Budget\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalHistory;
use App\Models\ApprovalWorkflow;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Budget\Http\Requests\BudgetRequestHeaderRequest;
use Modules\Budget\Models\BudgetRequestActivity;
use Modules\Budget\Models\BudgetRequestActivityDocument;
use Modules\Budget\Models\BudgetRequestApproval;
use Modules\Budget\Models\BudgetRequestHeader;
use Modules\Budget\Models\BudgetRequestItem;
use Modules\Budget\Models\BudgetRequestItemGood;

class BudgetRequestController extends BaseApiController
{
    protected $searchableColumns = ['request_no'];
    protected $filterableColumns = ['status'];
    protected $sortableColumns = ['request_no'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new BudgetRequestHeader());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with([
                'fiscalYear:id,year',
                'academicPeriod:id,academic_year,semester',
                'unit:id,unit_code,unit_name',
                'budgetCategory:id,name',
                'subBudgetCategory:id,name',
                'requestActivities:id,description,budget_request_header_id',
                'currentApproval:id,budget_request_header_id,role_id,status,is_current',
                'currentApproval.role:id,name'
            ])
            ->orderBy('request_no');


        $this->applySearch($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $page = $request->input('page', 1);
        $perPage = $this->getPerPage($request);

        $data = $query->paginate($perPage, ['*'], 'page', $page);

        $data->getCollection()->transform(function ($item) {
            $currentApproval = $item->currentApproval;

            if ($item->status === 'approved') {
                $item->approval_status_label = 'Approved';
            } elseif ($item->status === 'rejected') {
                $item->approval_status_label = 'Rejected';
            } elseif ($currentApproval) {
                $item->approval_status_label = 'Menunggu persetujuan ' . $currentApproval->role->name;
            } else {
                $item->approval_status_label = ucfirst($item->status);
            }

            return $item;
        });

        return $this->formatDataTableResponse($data, $request);
    }

    public function store(Request $request): JsonResponse
    {

        if ($request->has('budget_request_activities_json')) {
            $decoded = json_decode($request->input('budget_request_activities_json'), true);

            $request->merge([
                'budget_request_activities' => $decoded
            ]);
        }

        $this->parseGoodsJson($request);

        $formRequest = app(BudgetRequestHeaderRequest::class);
        validator($request->all(), $formRequest->rules())->validate();

        DB::beginTransaction();

        try {

            // Simpan Header
            $headerData = [
                'request_date' => $request->request_date,
                'fiscal_year_id' => $request->fiscal_year_id,
                'academic_period_id' => $request->academic_period_id,
                'budget_type' => $request->budget_type,
                'budget_category_id' => $request->budget_category_id,
                'sub_budget_category_id' => $request->sub_budget_category_id,
                'unit_id' => $request->unit_id,
                'notes' => $request->notes,
                'total_amount' => $request->total_amount,
                'status' => 'draft',
                'created_by' => Auth::id(),
            ];

            $requestHeader = BudgetRequestHeader::create($headerData);

            // Simpan Activities, Items, Goods, dan Documents
            foreach ($request->budget_request_activities as $activityData) {

                // Simpan activity menggunakan relationship requestActivities()
                $activity = $requestHeader->requestActivities()->create([
                    'activity_id' => $activityData['activity_id'],
                    'description' => $activityData['description'] ?? null,
                    'total_amount' => $activityData['total_amount'],
                    'output_indicator' => $activityData['output_indicator'],
                    'start_date' => $activityData['start_date'],
                    'end_date' => $activityData['end_date'],
                ]);

                // Simpan Items
                if (isset($activityData['request_items']) && !empty($activityData['request_items'])) {
                    foreach ($activityData['request_items'] as $itemData) {
                        $item = $activity->requestItems()->create([
                            'activity_item_id' => $itemData['activity_item_id'],
                            'description' => $itemData['description'],
                            'unit_measure_id' => $itemData['unit_measure_id'],
                            'volume' => $itemData['volume'],
                            'unit_price' => $itemData['unit_price'],
                            'total_amount' => $itemData['total_amount'],
                            'notes' => $itemData['notes'] ?? null,
                        ]);

                        // ========== SIMPAN GOODS UNTUK ITEM INI ==========
                        if (isset($itemData['goods']) && !empty($itemData['goods'])) {
                            foreach ($itemData['goods'] as $goodData) {
                                // Calculate subtotal if not provided
                                $subtotal = ($goodData['quantity'] ?? 1) * ($goodData['unit_price'] ?? 0);

                                $item->goods()->create([
                                    'item_name' => $goodData['item_name'],
                                    'goods_type' => $goodData['goods_type'] ?? 'bhp',
                                    'specification' => $goodData['specification'] ?? null,
                                    'brand' => $goodData['brand'] ?? null,
                                    'quantity' => $goodData['quantity'] ?? 1,
                                    'unit_measure' => $goodData['unit_measure'] ?? null,
                                    'unit_price' => $goodData['unit_price'] ?? 0,
                                    'subtotal' => $goodData['subtotal'] ?? $subtotal,
                                    'notes' => $goodData['notes'] ?? null,
                                ]);
                            }
                        }
                        // ========== END SIMPAN GOODS ==========
                    }
                }

                // Simpan Documents
                if (isset($activityData['documents']) && !empty($activityData['documents'])) {
                    foreach ($activityData['documents'] as $documentData) {
                        $filePath = $documentData['file_path'] ?? null;
                        $fileName = $documentData['file_name'] ?? null;
                        $fileSize = $documentData['file_size'] ?? null;
                        $fileType = $documentData['file_type'] ?? null;

                        // Handle file upload jika ada
                        if (isset($documentData['file'])) {
                            $file = $documentData['file'];
                            $originalName = $file->getClientOriginalName();
                            $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();

                            $filePath = $file->storeAs(
                                'budget-request-activities/' . $activity->id,
                                $fileName,
                                'public'
                            );

                            $fileSize = $file->getSize();
                            $fileType = $file->getMimeType();
                        }

                        $activity->documents()->create([
                            'document_name' => $documentData['document_name'],
                            'file_name' => $fileName,
                            'file_path' => $filePath,
                            'file_size' => $fileSize,
                            'file_type' => $fileType,
                            'uploaded_by' => Auth::id(),
                        ]);
                    }
                }
            }

            DB::commit();

            //Load untuk response
            $requestHeader->load([
                'requestActivities' => function ($q) {
                    $q->with([
                        'activity:id,activity_code,activity_name',
                        'requestItems' => function ($q2) {
                            $q2->with([
                                'activityItem:id,item_code,item_name',
                                'unitMeasure:id,name',
                                'goods' // Tambahkan eager loading untuk goods
                            ]);
                        },
                        'documents'
                    ]);
                },
                'fiscalYear:id,year',
                'academicPeriod:id,academic_year,semester',
                'unit:id,unit_name',
                'budgetCategory:id,name',
                'subBudgetCategory:id,name',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Budget request created successfully',
                'data' => $requestHeader
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Budget Request Store Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create budget request: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show($id): JsonResponse
    {
        $budgetRequest = BudgetRequestHeader::with([
            'fiscalYear:id,year',
            'academicPeriod:id,academic_year,semester',
            'unit:id,unit_name',
            'budgetCategory:id,name',
            'subBudgetCategory:id,name',
            'requestActivities' => function ($q) {
                $q->select('id', 'activity_id', 'description', 'budget_request_header_id', 'total_amount', 'start_date', 'end_date', 'output_indicator')
                    ->withSum([
                        'disbursements' => function ($qDisbursement) {
                            $qDisbursement->whereNotIn('status', ['draft', 'rejected']);
                        }
                    ], 'total_amount')
                    ->with([
                        'activity:id,activity_code,activity_name',
                        'requestItems' => function ($q2) {
                            $q2->with([
                                'activityItem' => function ($q3) {
                                    $q3->select('id', 'item_code', 'item_name', 'trans_type_id')
                                        ->with(['transType:id,code,name,group_code']);
                                },
                                'unitMeasure:id,name',
                                // ========== TAMBAHKAN GOODS ==========
                                'goods' => function ($q4) {
                                    $q4->select(
                                        'id',
                                        'budget_request_item_id',
                                        'item_name',
                                        'goods_type',
                                        'specification',
                                        'brand',
                                        'quantity',
                                        'unit_measure',
                                        'unit_price',
                                        'subtotal',
                                        'notes'
                                    );
                                }
                                // ========== END GOODS ==========
                            ])
                                ->withSum('disbursementItems', 'total_amount');
                        },
                        'documents'
                    ]);
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $budgetRequest
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $requestHeader = BudgetRequestHeader::lockForUpdate()
            ->findOrFail($id);

        // Validasi status, hanya draft yang bisa diupdate
        if (!in_array(strtolower($requestHeader->status), ['draft', 'returned'])) {
            return response()->json([
                'success' => false,
                'message' => 'Budget request can only be updated if status is DRAFT or RETURNED. Current status: ' . $requestHeader->status
            ], 422);
        }

        if ($request->has('budget_request_activities_json')) {
            $decoded = json_decode($request->input('budget_request_activities_json'), true);

            $request->merge([
                'budget_request_activities' => $decoded
            ]);
        }

        $this->parseGoodsJson($request);

        $formRequest = app(BudgetRequestHeaderRequest::class);
        $validated = validator($request->all(), $formRequest->rules())->validate();

        DB::beginTransaction();

        try {
            // 1. Update Header
            $headerData = array_filter([
                'request_date' => $request->request_date ?? $requestHeader->request_date,
                'fiscal_year_id' => $request->fiscal_year_id ?? $requestHeader->fiscal_year_id,
                'academic_period_id' => $request->academic_period_id ?? $requestHeader->academic_period_id,
                'budget_type' => $request->budget_type ?? $requestHeader->budget_type,
                'budget_category_id' => $request->budget_category_id ?? $requestHeader->budget_category_id,
                'sub_budget_category_id' => $request->sub_budget_category_id ?? $requestHeader->sub_budget_category_id,
                'unit_id' => $request->unit_id ?? $requestHeader->unit_id,
                'notes' => $request->notes ?? $requestHeader->notes,
                'total_amount' => $request->total_amount ?? $requestHeader->total_amount,
            ]);

            // Update request_no jika ada
            if ($request->has('request_no')) {
                $headerData['request_no'] = $request->request_no;
            }

            $requestHeader->update($headerData);

            // 2. Update Activities, Items, Goods, and Documents
            if ($request->has('budget_request_activities')) {
                // Get existing activities
                $existingActivities = $requestHeader->requestActivities()->get();
                $existingActivityIds = $existingActivities->pluck('id')->toArray();

                // Track which activities are updated/created
                $processedActivityIds = [];

                foreach ($request->budget_request_activities as $activityData) {
                    $activity = null;

                    if (empty($activityData['id'])) {
                        // CREATE: Activity baru
                        $activity = $requestHeader->requestActivities()->create([
                            'activity_id' => $activityData['activity_id'],
                            'description' => $activityData['description'] ?? null,
                            'total_amount' => $activityData['total_amount'],
                            'output_indicator' => $activityData['output_indicator'] ?? null,
                            'start_date' => $activityData['start_date'] ?? null,
                            'end_date' => $activityData['end_date'] ?? null,
                        ]);
                        $processedActivityIds[] = $activity->id;
                    } else {
                        // UPDATE: Activity existing
                        $activity = $existingActivities->firstWhere('id', $activityData['id']);
                        if ($activity) {
                            $activity->update([
                                'activity_id' => $activityData['activity_id'],
                                'description' => $activityData['description'] ?? null,
                                'total_amount' => $activityData['total_amount'],
                                'output_indicator' => $activityData['output_indicator'] ?? null,
                                'start_date' => $activityData['start_date'] ?? null,
                                'end_date' => $activityData['end_date'] ?? null,
                            ]);
                            $processedActivityIds[] = $activity->id;
                        }
                    }

                    // Skip if activity is null (shouldn't happen, but just in case)
                    if (!$activity) {
                        continue;
                    }

                    // Process Items for this activity
                    if (isset($activityData['request_items']) && !empty($activityData['request_items'])) {
                        // Get existing items for this activity
                        $existingItems = $activity->requestItems()->get();
                        $existingItemIds = $existingItems->pluck('id')->toArray();

                        // Track which items are updated/created
                        $processedItemIds = [];

                        foreach ($activityData['request_items'] as $itemData) {
                            $item = null;

                            if (empty($itemData['id'])) {
                                // CREATE: Item baru
                                $item = $activity->requestItems()->create([
                                    'activity_item_id' => $itemData['activity_item_id'],
                                    'description' => $itemData['description'],
                                    'unit_measure_id' => $itemData['unit_measure_id'],
                                    'volume' => $itemData['volume'],
                                    'unit_price' => $itemData['unit_price'],
                                    'total_amount' => $itemData['total_amount'],
                                    'notes' => $itemData['notes'] ?? null,
                                ]);
                                $processedItemIds[] = $item->id;
                            } else {
                                // UPDATE: Item existing
                                $item = $existingItems->firstWhere('id', $itemData['id']);
                                if ($item) {
                                    $item->update([
                                        'activity_item_id' => $itemData['activity_item_id'],
                                        'description' => $itemData['description'],
                                        'unit_measure_id' => $itemData['unit_measure_id'],
                                        'volume' => $itemData['volume'],
                                        'unit_price' => $itemData['unit_price'],
                                        'total_amount' => $itemData['total_amount'],
                                        'notes' => $itemData['notes'] ?? null,
                                    ]);
                                    $processedItemIds[] = $item->id;
                                }
                            }

                            // Skip if item is null
                            if (!$item) {
                                continue;
                            }

                            // ========== PROCESS GOODS FOR THIS ITEM ==========
                            if (isset($itemData['goods'])) {
                                if (!empty($itemData['goods'])) {
                                    // Get existing goods for this item
                                    $existingGoods = $item->goods()->get();
                                    $existingGoodIds = $existingGoods->pluck('id')->toArray();

                                    // Track which goods are updated/created
                                    $processedGoodIds = [];

                                    foreach ($itemData['goods'] as $goodData) {
                                        // Calculate subtotal if not provided
                                        $subtotal = ($goodData['quantity'] ?? 1) * ($goodData['unit_price'] ?? 0);

                                        if (empty($goodData['id'])) {
                                            // CREATE: Good baru
                                            $good = $item->goods()->create([
                                                'item_name' => $goodData['item_name'],
                                                'goods_type' => $goodData['goods_type'] ?? 'bhp',
                                                'specification' => $goodData['specification'] ?? null,
                                                'brand' => $goodData['brand'] ?? null,
                                                'quantity' => $goodData['quantity'] ?? 1,
                                                'unit_measure' => $goodData['unit_measure'] ?? null,
                                                'unit_price' => $goodData['unit_price'] ?? 0,
                                                'subtotal' => $goodData['subtotal'] ?? $subtotal,
                                                'notes' => $goodData['notes'] ?? null,
                                            ]);
                                            $processedGoodIds[] = $good->id;
                                        } else {
                                            // UPDATE: Good existing
                                            $good = $existingGoods->firstWhere('id', $goodData['id']);
                                            if ($good) {
                                                $good->update([
                                                    'item_name' => $goodData['item_name'],
                                                    'goods_type' => $goodData['goods_type'] ?? $good->goods_type,
                                                    'specification' => $goodData['specification'] ?? $good->specification,
                                                    'brand' => $goodData['brand'] ?? $good->brand,
                                                    'quantity' => $goodData['quantity'] ?? $good->quantity,
                                                    'unit_measure' => $goodData['unit_measure'] ?? $good->unit_measure,
                                                    'unit_price' => $goodData['unit_price'] ?? $good->unit_price,
                                                    'subtotal' => $goodData['subtotal'] ?? $subtotal,
                                                    'notes' => $goodData['notes'] ?? $good->notes,
                                                ]);
                                                $processedGoodIds[] = $good->id;
                                            }
                                        }
                                    }

                                    // Delete goods that are no longer in the request
                                    $goodsToDelete = array_diff($existingGoodIds, $processedGoodIds);
                                    if (!empty($goodsToDelete)) {
                                        BudgetRequestItemGood::whereIn('id', $goodsToDelete)->delete();
                                    }
                                } else {
                                    // If goods array is empty, delete all existing goods for this item
                                    $item->goods()->delete();
                                }
                            }
                            // ========== END PROCESS GOODS ==========
                        }

                        // Delete items that are no longer in the request
                        $itemsToDelete = array_diff($existingItemIds, $processedItemIds);
                        if (!empty($itemsToDelete)) {
                            // Items will cascade delete goods
                            BudgetRequestItem::whereIn('id', $itemsToDelete)->delete();
                        }
                    } else {
                        // If no items provided, delete all existing items for this activity
                        $activity->requestItems()->delete();
                    }

                    // Process Documents for this activity
                    if (isset($activityData['documents']) && !empty($activityData['documents'])) {
                        // Get existing documents for this activity
                        $existingDocuments = $activity->documents()->get();
                        $existingDocumentIds = $existingDocuments->pluck('id')->toArray();

                        // Track which documents are updated/created
                        $processedDocumentIds = [];

                        foreach ($activityData['documents'] as $documentData) {
                            $filePath = $documentData['file_path'] ?? null;
                            $fileName = $documentData['file_name'] ?? null;
                            $fileSize = $documentData['file_size'] ?? null;
                            $fileType = $documentData['file_type'] ?? null;

                            // Handle file upload jika ada
                            if (isset($documentData['file']) && $documentData['file'] instanceof \Illuminate\Http\UploadedFile) {
                                $file = $documentData['file'];
                                $originalName = $file->getClientOriginalName();
                                $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();

                                $filePath = $file->storeAs(
                                    'budget-request-activities/' . $activity->id,
                                    $fileName,
                                    'public'
                                );

                                $fileSize = $file->getSize();
                                $fileType = $file->getMimeType();
                            }

                            if (empty($documentData['id'])) {
                                // CREATE: Document baru
                                $document = $activity->documents()->create([
                                    'document_name' => $documentData['document_name'],
                                    'file_name' => $fileName,
                                    'file_path' => $filePath,
                                    'file_size' => $fileSize,
                                    'file_type' => $fileType,
                                    'uploaded_by' => Auth::id(),
                                ]);
                                $processedDocumentIds[] = $document->id;
                            } else {
                                // UPDATE: Document existing
                                $document = $existingDocuments->firstWhere('id', (int)$documentData['id']);
                                if ($document) {
                                    // Update file info if new file uploaded
                                    if (isset($documentData['file']) && $documentData['file'] instanceof \Illuminate\Http\UploadedFile) {
                                        // Delete old file
                                        if ($document->file_path) {
                                            Storage::disk('public')->delete($document->file_path);
                                        }

                                        $document->update([
                                            'file_name' => $fileName,
                                            'file_path' => $filePath,
                                            'file_size' => $fileSize,
                                            'file_type' => $fileType,
                                        ]);
                                    }

                                    // Update document name
                                    $document->update([
                                        'document_name' => $documentData['document_name'] ?? $document->document_name,
                                    ]);

                                    $processedDocumentIds[] = $document->id;
                                }
                            }
                        }

                        // Delete documents that are no longer in the request
                        $documentsToDelete = array_diff($existingDocumentIds, $processedDocumentIds);
                        if (!empty($documentsToDelete)) {
                            $documents = BudgetRequestActivityDocument::whereIn('id', $documentsToDelete)->get();
                            foreach ($documents as $document) {
                                // Hapus file fisik dari storage
                                if ($document->file_path) {
                                    Storage::disk('public')->delete($document->file_path);
                                }
                                // Hapus record
                                $document->delete();
                            }
                        }
                    } else {
                        // If no documents provided, delete all existing documents
                        $documents = $activity->documents()->get();
                        foreach ($documents as $document) {
                            if ($document->file_path) {
                                Storage::disk('public')->delete($document->file_path);
                            }
                            $document->delete();
                        }
                    }
                }

                // Delete activities that are no longer in the request
                $activitiesToDelete = array_diff($existingActivityIds, $processedActivityIds);
                if (!empty($activitiesToDelete)) {
                    // Get documents to delete files
                    $activitiesToDeleteData = BudgetRequestActivity::whereIn('id', $activitiesToDelete)->get();
                    foreach ($activitiesToDeleteData as $activity) {
                        // Delete document files
                        $documents = $activity->documents()->get();
                        foreach ($documents as $document) {
                            if ($document->file_path) {
                                Storage::disk('public')->delete($document->file_path);
                            }
                        }
                    }

                    // Items, goods, and documents will be deleted automatically by cascade
                    BudgetRequestActivity::whereIn('id', $activitiesToDelete)->delete();
                }
            } else {
                // If no activities provided, delete all existing activities
                $activities = $requestHeader->requestActivities()->get();
                foreach ($activities as $activity) {
                    // Delete document files
                    $documents = $activity->documents()->get();
                    foreach ($documents as $document) {
                        if ($document->file_path) {
                            Storage::disk('public')->delete($document->file_path);
                        }
                    }
                }
                // Items and documents will cascade delete
                $requestHeader->requestActivities()->delete();
            }

            DB::commit();

            // Load untuk response
            $requestHeader->load([
                'requestActivities' => function ($q) {
                    $q->with([
                        'activity:id,activity_code,activity_name',
                        'requestItems' => function ($q2) {
                            $q2->with([
                                'activityItem:id,item_code,item_name',
                                'unitMeasure:id,name',
                                'goods' // Tambahkan eager loading untuk goods
                            ]);
                        },
                        'documents'
                    ]);
                },
                'fiscalYear:id,year',
                'academicPeriod:id,academic_year,semester',
                'unit:id,unit_name',
                'budgetCategory:id,name',
                'subBudgetCategory:id,name',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Budget request updated successfully',
                'data' => $requestHeader
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update budget request', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update budget request: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     *  Get BudgetRequestApproval
     */
    public function approvals($id): JsonResponse
    {
        try {
            // 1. Ambil header
            $header = BudgetRequestHeader::findOrFail($id);

            // 2. Ambil approvals + relasi
            $approvals = BudgetRequestApproval::with([
                'role:id,name',
                'approver' => function ($query) {
                    // Matikan global $with khusus untuk query approver disini
                    $query->select('id', 'name')->withoutEagerLoads();
                }
            ])
                ->where('budget_request_header_id', $id)
                ->orderBy('approval_level')
                ->get();

            // 3. Ambil current level dari DB
            $currentLevel = BudgetRequestApproval::where('budget_request_header_id', $id)
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
                    'header_status' => $header->status,
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

    public function approvalHistory(BudgetRequestHeader $request): JsonResponse
    {
        $history = ApprovalHistory::where('approvable_type', BudgetRequestHeader::class)
            ->where('approvable_id', $request->id)
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
            $header = BudgetRequestHeader::lockForUpdate()->findOrFail($id);

            // 2. Validasi status
            if ($header->status !== 'draft') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft can be submitted'
                ], 422);
            }

            $exists = BudgetRequestApproval::where('budget_request_header_id', $header->id)->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval already generated'
                ], 422);
            }

            // Ambil workflow
            $workflows = ApprovalWorkflow::where('module_name', 'perencanaan_anggaran')
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
                    'budget_request_header_id' => $header->id,
                    'approval_level' => $wf->approval_level,
                    'role_id' => $wf->role_id,
                    'status' => $isFirst ? 'pending' : 'waiting',
                    'is_current' => $isFirst,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            BudgetRequestApproval::insert($approvals);

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

            $header = BudgetRequestHeader::lockForUpdate()->findOrFail($headerId);

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
            $returnedApproval = BudgetRequestApproval::where(
                'budget_request_header_id',
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
            BudgetRequestApproval::where(
                'budget_request_header_id',
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

            $header->recordApproval('revise', 'returned', 'submitted');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Budeget request resubmitted successfully'
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
        DB::beginTransaction();

        try {
            // Lock approval
            $approval = BudgetRequestApproval::lockForUpdate()->findOrFail($approvalId);

            // Lock header
            $header = BudgetRequestHeader::lockForUpdate()
                ->findOrFail($approval->budget_request_header_id);

            // Validasi step aktif
            if (!$approval->is_current || $approval->status !== 'pending') {
                throw new \Exception('This approval is not active');
            }

            // Validasi role
            if (!Auth::user()->hasRole($approval->role->name)) {
                throw new \Exception('Unauthorized');
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
            $nextApproval = BudgetRequestApproval::where('budget_request_header_id', $approval->budget_disbursement_header_id)
                ->where('approval_level', '>', $approval->approval_level)
                ->orderBy('approval_level')
                ->lockForUpdate()
                ->first();

            $newStatus = $nextApproval ? 'submitted' : 'approved';

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
            // Lock approval
            $approval = BudgetRequestApproval::lockForUpdate()
                ->with('role')
                ->findOrFail($approvalId);

            // Lock header
            $header = BudgetRequestHeader::lockForUpdate()
                ->findOrFail($approval->budget_request_header_id);

            // Validasi step aktif
            if (!$approval->is_current || $approval->status !== 'pending') {
                throw new \Exception('This approval is not active');
            }

            // Validasi role
            if (!Auth::user()->hasRole($approval->role->name)) {
                throw new \Exception('Unauthorized');
            }

            // // Validasi header sudah final
            // if (in_array($header->status, ['approved'])) {
            //     throw new \Exception('Cannot reject finalized disbursement');
            // }

            // Update rejected, current dan notes
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

            $approval = BudgetRequestApproval::lockForUpdate()
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

            $header = BudgetRequestHeader::where('id', $approval->budget_request_header_id);

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
                if (!$user->hasPermissionTo('approve perencanaan_anggaran')) {
                    $query->where('unit_id', $user->unit_id);
                }
            } else {
                $query->where('unit_id', $user->unit_id);
            }
        }
    }

    /**
     * Parse goods_json menjadi array goods
     */
    private function parseGoodsJson(Request $request): void
    {
        if (!$request->has('budget_request_activities')) {
            return;
        }

        $activities = $request->budget_request_activities;

        foreach ($activities as $aIndex => $activityData) {
            if (!isset($activityData['request_items'])) {
                continue;
            }

            foreach ($activityData['request_items'] as $iIndex => $itemData) {
                if (isset($itemData['goods_json']) && is_string($itemData['goods_json'])) {
                    $decodedGoods = json_decode($itemData['goods_json'], true);

                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedGoods)) {
                        $activities[$aIndex]['request_items'][$iIndex]['goods'] = $decodedGoods;
                    }

                    unset($activities[$aIndex]['request_items'][$iIndex]['goods_json']);
                }
            }
        }

        $request->merge(['budget_request_activities' => $activities]);
    }
}
