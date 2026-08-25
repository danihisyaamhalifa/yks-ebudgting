<?php

use Illuminate\Support\Facades\Route;
use Modules\DataMaster\Http\Controllers\{ CoaController, UnitController, ActivityController, ParameterController, AcademicPeriodController, FiscalYearController, TransactionTypeController, BudgetCategoryController, CashBankController, EmployeeController, FundSourceController, VendorController};
use Modules\DataMaster\Http\Controllers\ActivityItemController;
use Modules\DataMaster\Http\Controllers\ParameterValueController;

Route::prefix('v1')
    ->middleware(['auth:sanctum'])
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | MASTER - SELECT OPTIONS
        |--------------------------------------------------------------------------
        */

        Route::prefix('select')->group(function () {
            Route::get('coas', [CoaController::class, 'forSelect']);
            Route::get('fiscal-years', [FiscalYearController::class, 'forSelect']);
            Route::get('academic-periods', [AcademicPeriodController::class, 'forSelect']);
            Route::get('units', [UnitController::class, 'forSelect']);
            Route::get('activities', [ActivityController::class, 'forSelect']);
            Route::get('cash-banks', [CashBankController::class, 'forSelect']);
            Route::get('fund-sources', [FundSourceController::class, 'forSelect']);
            Route::get('activity-items', [ActivityItemController::class, 'forSelect']);
            Route::get('employees', [EmployeeController::class, 'forSelect']);
            Route::get('vendors', [VendorController::class, 'forSelect']);
        });

        /*
        |--------------------------------------------------------------------------
        | SPECIAL ENDPOINTS
        |--------------------------------------------------------------------------
        */

        Route::get('coas-headers', [CoaController::class, 'getAccountHeaders']);
        Route::get('parameters/{groupCode}', [ParameterController::class, 'values']);

        Route::get('budget-category-root', [BudgetCategoryController::class, 'forRootSelect']);
        Route::get('budget-category-child', [BudgetCategoryController::class, 'forChildSelect']);

        /*
        |--------------------------------------------------------------------------
        | RESOURCES
        |--------------------------------------------------------------------------
        */

        Route::apiResource('parameters', ParameterController::class)->names([
            'index' => 'parameter.index',
        ]);

        Route::apiResource('parameter-values', ParameterValueController::class)->names([
            'index' => 'parameter-value.index',
        ]);

        Route::apiResource('units', UnitController::class)->names([
            'index' => 'unit.index',
        ]);

        Route::apiResource('fiscal-years', FiscalYearController::class)->names([
            'index' => 'fiscal-year.index',
        ]);

        Route::apiResource('academic-periods', AcademicPeriodController::class)->names([
            'index' => 'academic-period.index',
        ]);

        Route::apiResource('coas', CoaController::class)->names([
            'index' => 'coas.index'
        ]);

        Route::apiResource('transaction-types', TransactionTypeController::class)->names([
            'index' => 'transaction-type.index',
        ]);

        Route::apiResource('activities', ActivityController::class)->names([
            'index' => 'activity.index',
        ]);

        Route::apiResource('budget-categories', BudgetCategoryController::class)->names([
            'index' => 'budget-category.index',
        ]);

        Route::apiResource('cash-banks', CashBankController::class)
            ->where(['cash_bank' => '[0-9]+']) // extra safety
            ->names([
                'index' => 'cash-banks.index'
            ]);

        Route::apiResource('fund-sources', FundSourceController::class)->names([
            'index' => 'fund-sources.index'
        ]);

        Route::apiResource('activity-items', ActivityItemController::class)->names([
            'index' => 'activity_items.index'
        ]);

        Route::apiResource('employees', EmployeeController::class)->names([
            'index' => 'employees.index'
        ]);

        Route::apiResource('vendors', VendorController::class)->names([
            'index' => 'vendors.index'
        ]);
    });