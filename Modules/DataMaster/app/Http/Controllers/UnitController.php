<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\Unit;

class UnitController extends BaseApiController
{
    protected $searchableColumns = ['unit_code', 'unit_name'];
    protected $filterableColumns = ['unit_type'];
    protected $sortableColumns = ['unit_code', 'unit_name'];
    protected $defaultSort = ['created_at' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Unit());
    }

    /**
     * Menampilkan list unit.
     */
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

    /**
     * Menampikan unit untuk dropdown/select inputs.
     */
    public function forSelect(): JsonResponse
    {
        $user = Auth()->user();

        $query = Unit::Active()
            ->select('id', 'unit_code', 'unit_name', 'unit_type')
            ->orderByRaw("FIELD(unit_type, 'prodi', 'unit', 'biro', 'rektorat'), unit_code ASC");

        // Jika bukan superadmin, filter berdasarkan unit_id mereka
        if (!$user->hasRole('Administrator')) {
            $query->where('id', $user->unit_id);
        }

        $units = $query->get();

        return response()->json([
            'data' => $units
        ]);
    }

    /**
     * Build base query with eager loading and filters.
     */
    protected function buildBaseQuery()
    {
         return $this->model->query();
    }
}
