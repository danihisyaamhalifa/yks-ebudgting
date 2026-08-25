<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\Parameter;
use Modules\DataMaster\Models\ParameterValue;

class ParameterController extends BaseApiController
{   
     protected $searchableColumns = ['group_code', 'group_name'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['group_code', 'group_name'];
    protected $defaultSort = ['created_at' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Parameter());
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
