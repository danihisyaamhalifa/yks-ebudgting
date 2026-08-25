<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\ParameterValue;

class ParameterValueController extends BaseApiController
{   
     protected $searchableColumns = ['code', 'name'];
    protected $filterableColumns = ['parameter_id'];
    protected $sortableColumns = ['code', 'name'];
    protected $defaultSort = ['created_at' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new ParameterValue());
    }

    public function index(Request $request): JsonResponse
    {
        $query = $query = $this->model->query();

        $this->applySearch($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $perPage = $this->getPerPage($request);
        $data = $query->paginate($perPage);

        return $this->formatDataTableResponse($data, $request);
    }

    public function values(string $groupCode)
    {
        $result = ParameterValue::query()
            ->whereHas(
                'parameter',
                fn($q) =>
                $q->where('group_code', $groupCode)
            )
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'code', 'name']);

        return response()->json([
            'data' => $result
        ]);
    }
}
