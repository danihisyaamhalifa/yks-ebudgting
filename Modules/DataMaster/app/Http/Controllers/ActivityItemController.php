<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\ActivityItem;

class ActivityItemController extends BaseApiController
{
    protected $searchableColumns = ['item_code', 'item_name'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['item_code', 'item_name'];
    protected $defaultSort = ['item_code' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new ActivityItem());
    }

    public function index(Request $request)
    {
        $query = $this->buildBaseQuery();

        $this->applySearch($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        // Get pagination parameters
        $page = $request->input('page', 1);
        $perPage = $this->getPerPage($request);

        // Execute query with pagination
        $data = $query->paginate($perPage, ['*'], 'page', $page);

        return $this->formatDataTableResponse($data, $request);
    }

    protected function buildBaseQuery()
    {
        return $this->model->query()
            ->with([
                'transType:id,code,name',
                'unitMeasure:id,code,name'
            ]);
    }

    // Get data for select
    public function forSelect()
    {
        $result = ActivityItem::active()
            ->with('transType:id,code,name,group_code')
            ->with('unitMeasure:id,code,name')
            ->get(['id', 'item_code', 'item_name', 'trans_type_id', 'unit_measure_id', 'estimation_price']);

        return response()->json([
            'data' => $result
        ]);
    }
}
