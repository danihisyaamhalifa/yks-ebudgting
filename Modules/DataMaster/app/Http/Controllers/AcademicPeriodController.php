<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\AcademicPeriod;

class AcademicPeriodController extends BaseApiController
{
    protected $searchableColumns = ['academic_year', 'semester'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['academic_year', 'academic_year'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new AcademicPeriod());
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
        $result = AcademicPeriod::active()
            ->get(['id', 'academic_year', 'semester', 'start_date'])
            ->append(['display_name', 'semester_name']);

        return response()->json([
            'data' => $result
        ]);
    }
}
