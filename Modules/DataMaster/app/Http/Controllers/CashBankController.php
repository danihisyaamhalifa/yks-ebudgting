<?php

namespace Modules\DataMaster\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Modules\DataMaster\Models\CashBank;

class CashBankController extends BaseApiController
{
    protected $searchableColumns = ['code', 'name'];
    protected $filterableColumns = ['is_active'];
    protected $sortableColumns = ['code', 'name', 'created_at'];
    protected $defaultSort = ['code' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new CashBank());
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

    public function show($id): JsonResponse
    {
        $cashBank = CashBank::findOrFail($id);
        return $this->successResponse($cashBank);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:cash_banks,code',
                'name' => 'required|string|max:255',
                'type' => 'nullable|string|max:50',
                'bank_name' => 'required_if:type,bank|nullable|string|max:255',
                'account_number' => 'nullable|string|max:100',
                'account_name' => 'nullable|string|max:255',
                'is_active' => 'boolean',
            ]);

            $cashBank = CashBank::create($validated);

            return $this->successResponse($cashBank, 'Kas/Bank berhasil ditambahkan');
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        }
    }


    public function update(Request $request, $id): JsonResponse
    {
        try {
            $cashBank = CashBank::findOrFail($id);

            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:cash_banks,code,' . $id,
                'name' => 'required|string|max:255',
                'type' => 'nullable|string|max:50',
                'bank_name' => 'required_if:type,bank|nullable|string|max:255', 
                'account_number' => 'nullable|string|max:100',                  
                'account_name' => 'nullable|string|max:255',                    
                'is_active' => 'boolean',
            ]);

            $cashBank->update($validated);

            return $this->successResponse($cashBank, 'Kas/Bank berhasil diperbarui');
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data Kas/Bank tidak ditemukan.'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        }
    }


    public function destroy($id): JsonResponse
    {
        $cashBank = CashBank::findOrFail($id);

        if ($this->isInUse($cashBank)) {
            return $this->errorResponse(
                true,
                'Kas/Bank masih digunakan oleh data lain dan tidak dapat dihapus',
                409
            );
        }

        $cashBank->delete();
        return $this->successResponse($cashBank, 'Kas/Bank berhasil dihapus');
    }

    public function forSelect(Request $request): JsonResponse
    {
        $query = CashBank::where('is_active', true);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $result = $query
            ->orderBy('code')
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return response()->json([
            'data' => $result,
            'message' => 'success',
            'success' => true,
        ]);
    }

    protected function buildBaseQuery()
    {
        return $this->model->query();
    }

    protected function isInUse(CashBank $cashBank): bool
    {
        return $cashBank->fundSources()->exists();
    }
}
