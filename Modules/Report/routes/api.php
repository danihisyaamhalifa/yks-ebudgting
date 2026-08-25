<?php

use Illuminate\Support\Facades\Route;
use Modules\Report\Http\Controllers\BudgetMonitoringController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
 Route::get('budget-monitoring/data', [BudgetMonitoringController::class, 'data'])
        ->name('api.budget-monitoring.data');
Route::get('budget-monitoring/summary', [BudgetMonitoringController::class, 'summary'])
        ->name('api.budget-monitoring.summary');
Route::get('/budget-monitoring/transactions/{id}', [BudgetMonitoringController::class, 'transactions']);
});
