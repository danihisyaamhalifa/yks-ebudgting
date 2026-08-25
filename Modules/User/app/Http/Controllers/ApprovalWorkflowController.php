<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApprovalWorkflowController extends BaseApiController
{
    public function __construct()
    {
        parent::__construct(new ApprovalWorkflow());
    }

    public function index(Request $request)
    {

        $query = $this->model->query()->with('role:id,name');

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

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'workflows' => 'required|array|min:1',
                'workflows.*.module_name' => 'required|string|in:perencanaan_anggaran,pengajuan_pencairan,realisasi_pencairan',
                'workflows.*.approval_level' => 'required|integer|min:1|max:10',
                'workflows.*.role_id' => 'required|integer|exists:roles,id',
            ]);

            $savedWorkflows = [];

            DB::beginTransaction();

            foreach ($validated['workflows'] as $workflow) {
                $savedWorkflows[] = ApprovalWorkflow::updateOrCreate(
                    [
                        'module_name' => $workflow['module_name'],
                        'approval_level' => $workflow['approval_level']
                    ],
                    [
                        'role_id' => $workflow['role_id']
                    ]
                );
            }

            DB::commit();
            $result = ApprovalWorkflow::with('role')
                ->whereIn('id', collect($savedWorkflows)->pluck('id'))
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Approval workflow saved successfully',
                'data' => $result
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save approval workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
