<?php

use Illuminate\Support\Facades\Route;
use Modules\Budget\Http\Controllers\BudgetRequestController;

Route::prefix('v1')
    ->middleware(['auth:sanctum'])
    ->group(function () {
        Route::apiResource('budget-requests', BudgetRequestController::class)->names([
            'index' => 'budget-requests.index',
        ]);

        Route::prefix('budget-requests')->group(function () {
            Route::post(
                '{id}/submit',
                [BudgetRequestController::class, 'submit']
            )->name('budget-requests.submit');

            Route::post(
                '{id}/resubmit',
                [BudgetRequestController::class, 'resubmit']
            )->name('budget-requests.resubmit');

            Route::get(
                '{id}/approvals',
                [BudgetRequestController::class, 'approvals']
            )->name('budget-requests.approvals');

            Route::get('{request}/approval-history', [BudgetRequestController::class, 'approvalHistory']
            )->name('budget-requests.approvalHistory');
        });


        // Approval Actions
        Route::prefix('budget-request-approvals')->group(function () {
            Route::post('{id}/approve', [BudgetRequestController::class, 'approve']);
            Route::post('{id}/reject', [BudgetRequestController::class, 'reject']);
            Route::post('{id}/returned', [BudgetRequestController::class, 'returned']);
        });
    });
