<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RoleController extends BaseApiController
{
    protected $searchableColumns = ['name', 'guard_name'];
    protected $filterableColumns = ['guard_name'];
    protected $sortableColumns = ['name', 'guard_name', 'created_at', 'updated_at'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new Role());
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // if ($user->hasRole('kitchen_admin')) {
        //     return $this->errorResponse('You do not have permission to access this resource.', 403);
        // }

        $query = $this->model->query()->with('permissions');

        if ($user->hasRole('mitra')) {
            $query->where('name', 'kitchen_admin');
        } elseif ($user->hasRole('central_admin')) {
            $query->whereNotIn('name', ['kitchen_admin', 'superadmin']);
        }

        $this->applySearch($query, $request);

        // Apply filters
        $this->applyFilters($query, $request);

        // Apply sorting
        $this->applySorting($query, $request);

        // Get pagination parameters
        if($request->input('view_all') == null) {
            // Get pagination parameters
            $page = $request->input('page', 1);
            $perPage = $this->getPerPage($request);
            // Execute query with pagination
            $data = $query->paginate($perPage, ['*'], 'page', $page);
        } else {
            $data = $query->get();
        }

        return $this->formatDataTableResponse($data, $request);
    }

    /**
     * Validate request data for role operations
     */
    protected function validateRequest(Request $request, $id = null): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'guard_name' => 'required|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name'
        ];

        $rules['name'] = $id
            ? 'required|string|max:255|unique:roles,name,' . $id . ',id,guard_name,' . $request->guard_name
            : 'required|string|max:255|unique:roles,name,NULL,id,guard_name,' . $request->guard_name;

        return $request->validate($rules);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        try {
            $role = Role::findOrFail($id);

            $validated = $this->validateRequest($request, $id);

            $role->update($validated);

            if ($request->has('permissions')) {
                $permissions = is_array($request->permissions)
                    ? $request->permissions
                    : json_decode($request->permissions, true) ?? [];

                $validPermissions = Permission::whereIn('name', $permissions)
                    ->pluck('name')
                    ->toArray();

                $role->syncPermissions($validPermissions);
            }

            return $this->successResponse($role, 'Role updated successfully');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}
