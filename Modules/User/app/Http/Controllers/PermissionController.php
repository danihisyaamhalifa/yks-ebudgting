<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PermissionController extends BaseApiController
{
    protected $searchableColumns = ['name'];
    protected $filterableColumns = ['name'];
    protected $sortableColumns = ['name', 'created_at', 'updated_at'];
    protected $defaultSort = ['name' => 'asc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;
    protected $permissionTypes = ['create', 'view', 'edit', 'delete', 'approve'];

    public function __construct()
    {
        parent::__construct(new Permission());
    }

    public function index(Request $request)
    {
        $query = $this->model->query();

        // Apply search
        $this->applySearch($query, $request);

        // Apply filters
        $this->applyFilters($query, $request);

        // Apply sorting
        $this->applySorting($query, $request);

        // Get all permissions
        $permissions = $query->get();

        // Group permissions by their base name
        $groupedPermissions = [];

        foreach ($permissions as $permission) {
            $baseName = $this->getBasePermissionName($permission->name);

            if (!isset($groupedPermissions[$baseName])) {
                $groupedPermissions[$baseName] = [
                    'id' => $permission->id, // Use the ID of the first permission in the group
                    'base_name' => $baseName,
                    'permissions' => []
                ];
            }

            // Add the permission to the group
            $groupedPermissions[$baseName]['permissions'][$this->getPermissionType($permission->name)] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'display_name' => $permission->display_name,
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ];
        }

        // Convert to collection
        $groupedPermissions = collect(array_values($groupedPermissions));
        
        // Handle pagination if not viewing all
        if ($request->input('view_all') == null) {
            $page = $request->input('page', 1);
            $perPage = $this->getPerPage($request);
            
            // Create paginator from collection
            $data = new \Illuminate\Pagination\LengthAwarePaginator(
                $groupedPermissions->forPage($page, $perPage),
                $groupedPermissions->count(),
                $perPage,
                $page,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        } else {
            $data = $groupedPermissions;
        }
        
        return $this->formatDataTableResponse($data, $request);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateRequest($request);

            // Get the exact input name and trim any extra spaces
            $baseName = trim($validated['name']);

            // Start a database transaction
            DB::beginTransaction();

            $createdPermissions = [];

            // Create all permission types
            foreach ($this->permissionTypes as $type) {
                $permissionName = "{$type} {$baseName}";
                $displayName = ucfirst($type) . ' ' . $baseName;

                // Check if permission already exists
                if (!Permission::where('name', $permissionName)->exists()) {
                    $createdPermissions[] = Permission::create([
                        'name' => $permissionName,
                        'display_name' => $displayName,
                        'guard_name' => $validated['guard_name'] ?? 'web'
                    ]);
                }
            }

            DB::commit();

            return $this->successResponse(
                $createdPermissions,
                count($createdPermissions) > 0
                    ? 'Permissions created successfully'
                    : 'Permissions already exist',
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e);
        }
    }

    /**
     * Validate the incoming request.
     */
    protected function validateRequest(Request $request, $resource = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'guard_name' => 'sometimes|string|max:255',
        ]);
    }

    /**
     * Get the base permission name from the input.
     * This is a simple passthrough since we want to keep the exact input format.
     */
    /**
     * Extract the base permission name (without the action prefix)
     */
    protected function getBasePermissionName(string $name): string
    {
        $parts = explode(' ', trim($name), 2);
        return count($parts) > 1 ? $parts[1] : $parts[0];
    }

    /**
     * Get the permission type (create, view, update, delete)
     */
    protected function getPermissionType(string $name): string
    {
        $parts = explode(' ', trim($name), 2);
        return strtolower($parts[0]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'base_name' => 'required|string|max:255',
                'permissions' => 'required|array',
                'permissions.create' => 'sometimes|boolean',
                'permissions.view' => 'sometimes|boolean',
                'permissions.update' => 'sometimes|boolean',
                'permissions.delete' => 'sometimes|boolean',
                'permissions.approve' => 'sometimes|boolean',
            ]);

            $baseName = trim($request->input('base_name'));
            $permissions = $request->input('permissions', []);

            // Find the permission group to update
            $permission = $this->model->findOrFail($id);
            $oldBaseName = $this->getBasePermissionName($permission->name);

            // Start transaction
            DB::beginTransaction();

            $updatedPermissions = [];

            // Handle each permission type
            foreach ($this->permissionTypes as $type) {
                $permissionName = "{$type} {$baseName}";
                $oldPermissionName = "{$type} {$oldBaseName}";
                $isEnabled = (bool)($permissions[$type] ?? false);

                // Find existing permission with the old name
                $existingPermission = Permission::where('name', $oldPermissionName)->first();

                if ($isEnabled) {
                    if ($existingPermission) {
                        // Update existing permission with new name if base name changed
                        if ($baseName !== $oldBaseName) {
                            $existingPermission->update(['name' => $permissionName]);
                        }
                        $updatedPermissions[] = $existingPermission;
                    } else {
                        // Create new permission if it doesn't exist
                        $updatedPermissions[] = Permission::create([
                            'name' => $permissionName,
                            'guard_name' => 'web'
                        ]);
                    }
                } else if ($existingPermission) {
                    // Delete permission if it exists but is not enabled
                    $existingPermission->delete();
                }
            }

            DB::commit();

            return $this->successResponse(
                $this->formatPermissionGroup($updatedPermissions),
                'Permissions updated successfully'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e);
        }
    }

    /**
     * Format a set of permissions as a group
     */
    protected function formatPermissionGroup(array $permissions): array
    {
        if (empty($permissions)) {
            return [];
        }

        $baseName = $this->getBasePermissionName($permissions[0]->name);
        $group = [
            'id' => $permissions[0]->id,
            'base_name' => $baseName,
            'permissions' => []
        ];

        foreach ($permissions as $permission) {
            $type = $this->getPermissionType($permission->name);
            $group['permissions'][$type] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ];
        }

        return $group;
    }
}
