<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\FiscalYear;

class FiscalYearController extends BaseApiController
{
    protected $searchableColumns = ['year', 'description'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['year', 'description'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new FiscalYear());
    }

    public function index(Request $request)
    {
        $query = $this->model->query();

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

    public function forSelect()
    {
        $result = FiscalYear::active()->get(['id', 'year']);

        return response()->json([
            'data' => $result
        ]);
    }
}