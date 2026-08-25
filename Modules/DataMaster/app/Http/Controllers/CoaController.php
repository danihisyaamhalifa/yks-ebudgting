<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Modules\DataMaster\Models\Coa;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CoaController extends BaseApiController
{
    protected $searchableColumns = ['account_code', 'account_name'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['account_code', 'account_name'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Coa());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->with(['parent:id,account_code,account_name'])
            ->orderBy('account_code');

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


    public function getAccountHeaders()
    {
        $parents = Coa::header()
            ->orderBy('account_code', 'asc')
            ->get();

        return $this->successResponse(
            $parents,
            'COA headers retrieved successfully'
        );
    }


    public function forSelect()
    {
        $result =  Coa::detail()
            ->orderBy('account_code', 'asc')
            ->get(['id', 'account_code', 'account_name']);

        return response()->json([
            'data' => $result
        ]);
    }
}
