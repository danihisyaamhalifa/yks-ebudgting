<?php

namespace Modules\DataMaster\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Api\BaseApiController;
use Modules\DataMaster\Models\Activity;

class ActivityController extends BaseApiController
{
    protected $searchableColumns = ['activity_code', 'activity_name'];
    protected $filterableColumns = [];
    protected $sortableColumns = ['activity_code', 'activity_name'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Activity());
    }

    public function index(Request $request)
    {
        $query = $this->model->query()
            ->where('is_active', true)
            ->orderByRaw("SUBSTRING(activity_code, 1, 3)")
            ->orderByRaw("CAST(SUBSTRING(activity_code, 4) AS UNSIGNED) ASC");

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

    // untuk komponen select
    public function forSelect(Request $request)
    {
        $unitId = $request->query('unit_id');
        $result = Activity::active()
            ->when($unitId, function ($query, $unitId) {
                return $query->where(function ($q) use ($unitId) {
                    // $q->WhereRaw('JSON_CONTAINS(unit_ids, ?)', [(string)$unitId]);
                    $q->whereNull('unit_ids')
                        ->orWhereJsonContains('unit_ids', (int) $unitId);
                });
            })
            ->get(['id', 'activity_code', 'activity_name', 'unit_ids']);

        return response()->json([
            'data' => $result
        ]);
    }
}
