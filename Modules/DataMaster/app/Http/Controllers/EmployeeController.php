<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\Employee;

class EmployeeController extends BaseApiController
{
    protected $searchableColumns = ['nik', 'nip', 'name'];
    protected $filterableColumns = ['unit_id'];
    protected $sortableColumns = ['nik', 'nip', 'name'];
    protected $defaultSort = ['created_at' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Employee());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with('unit:id,unit_name')
            ->with('employeeType:id,name')
            ->where('is_active', true);

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
        $result = Employee::active()
            ->with('employeeType:id,name')
            ->get(['id', 'nik', 'name', 'employee_type_id', 'bank_name', 'bank_account_number', 'bank_account_name']);

        return response()->json([
            'data' => $result
        ]);
    }
}
