<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\Vendor;

class VendorController extends BaseApiController
{
    protected $searchableColumns = ['vendor_code', 'name'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['vendor_code', 'name'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Vendor());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->where('is_active', true)
            ->orderBy('vendor_code');


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
        $result = Vendor::active()
            ->get(['id', 'tax_number', 'name', 'bank_name', 'bank_account_number', 'bank_account_name']);

        return response()->json([
            'data' => $result
        ]);
    }
}
