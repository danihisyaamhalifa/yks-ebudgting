<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ApprovalWorkflowHeader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\DataMaster\Models\Unit;

class ApprovalWorkflowHeaderController extends BaseApiController
{
    public function __construct()
    {
        parent::__construct(new ApprovalWorkflowHeader());
    }

    /**
     * List all approval workflow headers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ApprovalWorkflowHeader::query()
            ->withCount('units as units_count')
            ->withCount('workflows as workflows_count');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $headers = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $headers->map(fn ($h) => [
                'id' => $h->id,
                'name' => $h->name,
                'description' => $h->description,
                'unit_type' => $h->unit_type,
                'units_count' => $h->units_count,
                'workflows_count' => $h->workflows_count,
            ]),
        ]);
    }

    /**
     * Lightweight list for dropdown selectors (e.g. on the Unit form).
     */
    public function forSelect(): JsonResponse
    {
        $headers = ApprovalWorkflowHeader::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return response()->json([
            'data' => $headers,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:150',
                'description' => 'nullable|string|max:1000',
                'unit_type' => 'nullable|string|in:unit,biro,prodi,rektorat',
            ]);

            $header = ApprovalWorkflowHeader::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'unit_type' => $validated['unit_type'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Approval workflow header created',
                'data' => $header->fresh(),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create approval workflow header',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        try {
            $header = ApprovalWorkflowHeader::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:150',
                'description' => 'nullable|string|max:1000',
                'unit_type' => 'nullable|string|in:unit,biro,prodi,rektorat',
            ]);

            $header->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'unit_type' => $validated['unit_type'] ?? $header->unit_type,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Approval workflow header updated',
                'data' => $header->fresh(),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Header not found',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update approval workflow header',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $header = ApprovalWorkflowHeader::findOrFail($id);

            // Prevent deletion if any unit is still using this header.
            $usedBy = Unit::where('approval_workflow_id', $header->id)->count();
            if ($usedBy > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Header masih dipakai oleh {$usedBy} unit. Batalkan penggunaan pada unit terlebih dahulu.",
                ], 422);
            }

            $header->delete();

            return response()->json([
                'success' => true,
                'message' => 'Approval workflow header deleted',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Header not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete approval workflow header',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
