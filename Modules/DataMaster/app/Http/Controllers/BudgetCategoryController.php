<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Modules\DataMaster\Models\BudgetCategory;

class BudgetCategoryController extends BaseApiController
{
    protected $searchableColumns = ['code', 'name'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['code', 'name'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new BudgetCategory());
    }

    public function index(Request $request)
    {
        $query = $query = $this->buildBaseQuery();

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
        try {
            $validated = $request->validate([
                'code' => 'nullable|string|max:20|unique:budget_categories,code',
                'name' => 'required|string|max:200',
                'budget_type'     => 'nullable|in:budgeter,non_budgeter',
                'sub_budget_type' => 'required_if:budget_type,non_budgeter|in:rutin,non_rutin,kondisional|nullable',
                'parent_id' => 'nullable|exists:budget_categories,id',
                'is_active' => 'boolean',
                'unit_ids' => 'nullable|array',
                'unit_ids.*' => 'integer|exists:units,id',
            ]);

            $validated['unit_ids'] = empty($validated['unit_ids'])
                ? null : array_values(array_unique($validated['unit_ids']));

            $budgetCategory = BudgetCategory::create($validated);

            return $this->successResponse($budgetCategory, 'Kategori Anggaran berhasil dibuat', 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        }
    }


    public function update(Request $request, $id): JsonResponse
    {
        try {
            $budgetCategory = BudgetCategory::findOrFail($id);

            $validated = $request->validate([
                'code' => 'nullable|string|max:20|unique:budget_categories,code,' . $id,
                'name' => 'required|string|max:200',
                'budget_type'     => 'nullable|in:budgeter,non_budgeter',
                'sub_budget_type' => 'required_if:budget_type,non_budgeter|in:rutin,non_rutin,kondisional|nullable',
                'parent_id' => 'nullable|exists:budget_categories,id',
                'is_active' => 'boolean',
                'unit_ids' => 'nullable|array',
                'unit_ids.*' => 'integer|exists:units,id',
            ]);

            $validated['unit_ids'] = empty($validated['unit_ids'])
                ? null : array_values(array_unique($validated['unit_ids']));

            $budgetCategory->update($validated);

            return $this->successResponse($budgetCategory, 'Kaegori Anggaran berhasil diperbarui');
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data Kaegori Anggaran tidak ditemukan.'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function forRootSelect(Request $request)
    {
        $budgetType = $request->query('budget_type');
        $unitId = $request->query('unit_id');

        return BudgetCategory::root()
            ->when($budgetType, function ($query, $budgetType) {
                return $query->where('budget_type', $budgetType);
            })
            ->when($unitId, function ($query, $unitId) {
                return $query->where(function ($q) use ($unitId) {
                    $q->whereNull('unit_ids')
                        ->orWhereJsonContains('unit_ids', (int) $unitId);
                });
            })
            ->get(['id', 'code', 'name', 'unit_ids']);
    }


    public function forChildSelect(Request $request)
    {
        $parentId = $request->query('parent_id');
        $unitId = $request->query('unit_id');

        return BudgetCategory::child()
            ->when($parentId, function ($query, $parentId) {
                return $query->where('parent_id', $parentId);
            })
            ->when($unitId, function ($query, $unitId) {
                return $query->where(function ($q) use ($unitId) {
                    $q->whereNull('unit_ids')
                        ->orWhereJsonContains('unit_ids', (int) $unitId);
                });
            })
            ->get(['id', 'code', 'name', 'unit_ids']);
    }

    protected function buildBaseQuery()
    {
        return $this->model->query()
            ->with([
                'parent:id,code,name',
            ])
            ->withCount('children')
            ->where('is_active', true)
            ->orderBy('code');
    }

    /**
     * Overwrite applyFilters
     */
    protected function applyFilters($query, Request $request): void
    {
        parent::applyFilters($query, $request);

        $filters = $request->input('filter', []);

        foreach ($filters as $field => $value) {
            if (is_null($value) || $value === '') {
                continue;
            }

            switch ($field) {
                case 'level':
                    if ($value === 'root') {
                        $query->whereNull('parent_id');
                    } elseif ($value === 'child') {
                        $query->whereNotNull('parent_id');
                    }
                    break;

                default:
                    $query->where($field, $value);
                    break;
            }
        }
    }
}
