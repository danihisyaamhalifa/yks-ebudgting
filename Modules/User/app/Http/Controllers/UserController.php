<?php

namespace Modules\User\Http\Controllers;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends BaseApiController
{
    protected $searchableColumns = ['name', 'username', 'email', 'position'];
    protected $filterableColumns = ['unit_id'];
    protected $sortableColumns = ['name', 'username', 'email', 'created_at', 'updated_at'];
    protected $defaultSort = ['created_at' => 'desc'];
    protected $defaultPerPage = 10;
    protected $maxPerPage = 100;

    public function __construct()
    {
        parent::__construct(new User());
    }

    /**
     * Menampilkan list user
     */
    public function index(Request $request): JsonResponse
    {
        $query = $this->buildBaseQuery();

        $this->applySearchWithRoles($query, $request);
        $this->applyFilters($query, $request);
        $this->applySorting($query, $request);

        $perPage = $this->getPerPage($request);
        $data = $query->paginate($perPage);

        $this->appendRoleNames($data);

        return $this->formatDataTableResponse($data, $request);
    }

    /**
     * Simpan user baru
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateStoreRequest($request);

        DB::beginTransaction();

        try {
            $user = $this->createUser($validated);
            $user->assignRole($validated['role']);

            DB::commit();

            return $this->successResponse(
                $user->load('roles'),
                'User berhasil dibuat',
                201
            );
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->errorResponse(
                'Gagal membuat user: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Update user.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $validated = $this->validateUpdateRequest($request, $user);

        DB::beginTransaction();

        try {
            $this->updateUser($user, $validated);

            if (!empty($validated['password'])) {
                $this->updatePassword($user, $validated['password']);
            }

            $user->syncRoles([$validated['role']]);

            DB::commit();

            return $this->successResponse(
                'User berhasil diupdate',
                $user->load('roles')
            );
        } catch (\Throwable $e) {
            DB::rollBack();

            return $this->errorResponse(
                'Gagal update user',
                500,
                $e->getMessage()
            );
        }
    }

    /**
     * Build base query with eager loading.
     */
    protected function buildBaseQuery(): Builder
    {
        return $this->model->query()
            ->with(['unit:id,unit_code,unit_name']);
    }

    /**
     * Apply search with role name support.
     */
    protected function applySearchWithRoles(Builder $query, Request $request): void
    {
        $search = $request->input('search');

        if (empty($search)) {
            return;
        }

        $query->where(function (Builder $q) use ($search) {
            // Search in user columns
            foreach ($this->searchableColumns as $column) {
                $q->orWhere($column, 'LIKE', "%{$search}%");
            }

            // Search in role names
            $q->orWhereHas('roles', function (Builder $roleQuery) use ($search) {
                $roleQuery->where('name', 'LIKE', "%{$search}%");
            });
        });
    }

    /**
     * Append role names to collection.
     */
    protected function appendRoleNames($data): void
    {
        $data->each(function ($item) {
            $this->appendRoleName($item);
        });
    }

    /**
     * Append role name to single user.
     */
    protected function appendRoleName(User $user): void
    {
        $roleName = $user->roles->pluck('name')->first() ?? 'user';
        $user->roleName = str_replace('_', ' ', $roleName);
    }

    /**
     * Validate store request.
     */
    protected function validateStoreRequest(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'unit_id' => 'nullable|exists:units,id',
            'position' => 'nullable|string|max:255',
            'role' => 'required|string|exists:roles,name',
        ]);
    }

    /**
     * Validate update request.
     */
    protected function validateUpdateRequest(Request $request, User $user): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'unit_id' => 'nullable|exists:units,id',
            'position' => 'nullable|string|max:255',
            'role' => 'required|string|exists:roles,name',
        ]);
    }

    /**
     * Create new user.
     */
    protected function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'unit_id' => $data['unit_id'] ?? null,
            'position' => $data['position'] ?? null,
        ]);
    }

    /**
     * Update existing user.
     */
    protected function updateUser(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'unit_id' => $data['unit_id'] ?? null,
            'position' => $data['position'] ?? null,
        ]);

        return $user;
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request, $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $validator = Validator::make($request->all(), [
                // 'confirmed' otomatis mengecek 'password_confirmation'
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors(), 422);
            }

            $validatedData = $validator->validated();
            $this->updatePassword($user, $validatedData['password']);
            return $this->successResponse(null, 'Password changed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to change password: ' . $e->getMessage(), 500);
        }
    }

    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $validator = Validator::make($request->all(), [
                'current_password' => ['required', 'string', 'current_password'],
                'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            ]);

            if ($validator->fails()) {
                return $this->errorResponse($validator->errors(), 422);
            }

            $validatedData = $validator->validated();
            $this->updatePassword($user, $validatedData['password']);

            return $this->successResponse(null, 'Password changed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to change password: ' . $e->getMessage(), 500);
        }
    }

    protected function updatePassword(User $user, string $password): void
    {
        $user->update(['password' => Hash::make($password)]);
    }
}
