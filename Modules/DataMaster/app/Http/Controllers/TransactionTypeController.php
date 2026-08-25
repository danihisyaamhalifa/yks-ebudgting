<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\TransactionType;

class TransactionTypeController extends BaseApiController
{
    protected $searchableColumns = ['kode_transaksi', 'nama_transaksi'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['kode_transaksi', 'nama_transaksi'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new TransactionType());
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
}
