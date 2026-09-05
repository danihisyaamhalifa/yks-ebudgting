<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowHeader;
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
        // When a header is selected, return its module workflows with steps.
        if ($headerId = $request->input('header_id')) {
            $header = ApprovalWorkflowHeader::with('workflows.steps.role:id,name')
                ->findOrFail($headerId);

            return response()->json([
                'success' => true,
                'data' => [
                    'header_id' => $header->id,
                    'name' => $header->name,
                    'description' => $header->description,
                    'workflows' => $header->workflows->map(fn ($wf) => [
                        'id' => $wf->id,
                        'module_name' => $wf->module_name,
                        'steps' => $wf->steps
                            ->sortBy('approval_level')
                            ->values()
                            ->map(fn ($step) => [
                                'id' => $step->id,
                                'approval_level' => $step->approval_level,
                                'role_id' => $step->role_id,
                                'role' => $step->role ? ['id' => $step->role->id, 'name' => $step->role->name] : null,
                            ]),
                    ])->values(),
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'header_id' => 'required|integer|exists:approval_workflow_header,id',
                'workflows' => 'required|array|min:1',
                'workflows.*.module_name' => 'required|string|in:perencanaan_anggaran,pengajuan_pencairan,realisasi_pencairan,pertanggungjawaban_anggaran',
                'workflows.*.steps' => 'required|array|min:1',
                'workflows.*.steps.*.approval_level' => 'required|integer|min:1|max:10',
                'workflows.*.steps.*.role_id' => 'required|integer|exists:roles,id',
            ]);

            DB::beginTransaction();

            $header = ApprovalWorkflowHeader::findOrFail($validated['header_id']);

            foreach ($validated['workflows'] as $workflow) {
                $moduleWf = ApprovalWorkflow::updateOrCreate(
                    [
                        'approval_workflow_header_id' => $header->id,
                        'module_name' => $workflow['module_name'],
                    ],
                    []
                );

                $moduleWf->steps()->delete();

                foreach ($workflow['steps'] as $step) {
                    $moduleWf->steps()->create([
                        'approval_level' => $step['approval_level'],
                        'role_id' => $step['role_id'],
                    ]);
                }
            }

            DB::commit();

            $result = ApprovalWorkflowHeader::with('workflows.steps.role:id,name')
                ->find($header->id);

            return response()->json([
                'success' => true,
                'message' => 'Approval workflow saved successfully',
                'data' => $result,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to save approval workflow',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
