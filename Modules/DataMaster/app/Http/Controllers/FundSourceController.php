<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Modules\DataMaster\Models\FundSource;
use Modules\Transaction\Models\FundTransfer;

class FundSourceController extends BaseApiController
{
    protected $searchableColumns = ['code', 'name', 'description'];
    protected $filterableColumns = ['fund_source_type'];
    protected $sortableColumns = ['code', 'name', 'fund_source_type', 'created_at'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new FundSource());
    }

    public function index(Request $request): JsonResponse
    {
        $query = $this->buildBaseQuery();

        $this->applySearch($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $perPage = $this->getPerPage($request);
        $data = $query->paginate($perPage);

        return $this->formatDataTableResponse($data, $request);
    }

    public function forSelect(): JsonResponse
    {
        $result = FundSource::active()
            ->select('id', 'code', 'name', 'fund_source_type', 'cash_bank_id')
            ->with([
                'cashBank:id,code,name'
            ])->get();

        return response()->json([
            'data' => $result
        ]);
    }

    protected function buildBaseQuery()
    {
        return  $this->model->query()
            ->with([
                'cashBank:id,code,name'
            ]);
    }
}
