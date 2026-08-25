<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\ApprovalWorkflowController;
use Modules\User\Http\Controllers\UserController;
use Modules\User\Http\Controllers\RoleController;
use Modules\User\Http\Controllers\PermissionController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('users', UserController::class)->names('user');

    Route::apiResource('roles', RoleController::class)->names([
        'index' => 'roles.index',
        'store' => 'roles.store',
        'show' => 'roles.show',
        'update' => 'roles.update',
        'destroy' => 'roles.destroy',
    ]);

    Route::apiResource('permissions', PermissionController::class)->names([
        'index' => 'permissions.index',
        'store' => 'permissions.store',
        'show' => 'permissions.show',
        'update' => 'permissions.update',
        'destroy' => 'permissions.destroy',
    ]);

    Route::apiResource('approval-workflows', ApprovalWorkflowController::class)->names([
        'index' => 'approval-workflow.index',
        'store' => 'approval-workflow.store',
        'show' => 'approval-workflow.show',
        'update' => 'approval-workflow.update',
        'destroy' => 'approval-workflow.destroy',
    ]);

    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword'])->name('user.reset-password');
    Route::post('users/change-password', [UserController::class, 'changePassword'])->name('user.change-password');
});
