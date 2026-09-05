<?php

use Illuminate\Support\Facades\Route;
use Modules\Disbursement\Http\Controllers\BudgetAccountabilityController;
use Modules\Disbursement\Http\Controllers\BudgetDisbursementController;
use Modules\Disbursement\Http\Controllers\BudgetFundReleaseController;

Route::prefix('v1')
    ->middleware(['auth:sanctum'])
    ->group(function () {
        Route::apiResource('budget-disbursements', BudgetDisbursementController::class)->names([
            'index' => 'budget-disbursements.index',
        ]);

        Route::prefix('budget-disbursements')->group(function () {
            Route::get(
                '{id}/approvals',
                [BudgetDisbursementController::class, 'approvals']
            )->name('budget-disbursements.approvals');

            Route::get('{disbursement}/approval-history', [BudgetDisbursementController::class, 'approvalHistory']
            )->name('budget-disbursements.approvalHistory');
        });



        // Approval Actions
        Route::prefix('budget-disbursement-approvals')->group(function () {
            Route::post('{id}/submit', [BudgetDisbursementController::class, 'submit']);
            Route::post('{id}/resubmit', [BudgetDisbursementController::class, 'resubmit']);
            Route::post('{id}/approve', [BudgetDisbursementController::class, 'approve']);
            Route::post('{id}/reject', [BudgetDisbursementController::class, 'reject']);
            Route::post('{id}/return', [BudgetDisbursementController::class, 'returned']);
        });

        Route::apiResource('budget-fund-releases', BudgetFundReleaseController::class)->names([
            'index' => 'budget-fund-releases.index',
        ]);

        Route::prefix('budget-fund-releases')->group(function () {
            Route::get(
                '{id}/approvals',
                [BudgetFundReleaseController::class, 'approvals']
            )->name('budget-fund-releases.approvals');
        });

        // Approval Actions
        Route::prefix('budget-fund-release-approvals')->group(function () {
            Route::post('{id}/submit', [BudgetFundReleaseController::class, 'submit']);
            Route::post('{id}/resubmit', [BudgetFundReleaseController::class, 'resubmit']);
            Route::post('{id}/approve', [BudgetFundReleaseController::class, 'approve']);
            Route::post('{id}/reject', [BudgetFundReleaseController::class, 'reject']);
            Route::post('{id}/return', [BudgetFundReleaseController::class, 'returned']);
        });


        Route::apiResource('budget-accountabilities', BudgetAccountabilityController::class)->names([
            'index' => 'budget.accountability.index',
        ]);

        Route::prefix('budget-accountabilities')->group(function () {
            Route::get(
                '{id}/approvals',
                [BudgetAccountabilityController::class, 'approvals']
            )->name('budget-accountabilities.approvals');
        });

        // Approval Actions
        Route::prefix('budget-accountability-approvals')->group(function () {
            Route::post('{id}/submit', [BudgetAccountabilityController::class, 'submit']);
            Route::post('{id}/resubmit', [BudgetAccountabilityController::class, 'resubmit']);
            Route::post('{id}/approve', [BudgetAccountabilityController::class, 'approve']);
            Route::post('{id}/reject', [BudgetAccountabilityController::class, 'reject']);
            Route::post('{id}/return', [BudgetAccountabilityController::class, 'returned']);
        });
    });
