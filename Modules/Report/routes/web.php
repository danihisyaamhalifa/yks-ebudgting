<?php

use Illuminate\Support\Facades\Route;
use Modules\Report\Http\Controllers\BudgetMonitoringController;

Route::middleware(['auth', 'verified'])->group(function () {
     Route::get('/monitoring-anggaran', [BudgetMonitoringController::class, 'index'])
        ->name('budget-monitoring.index');
});
