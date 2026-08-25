<?php

use Illuminate\Support\Facades\Route;
use Modules\Transaction\Http\Controllers\FundTransferController;
use Modules\Transaction\Http\Controllers\CashMutationController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('fund-transfers', FundTransferController::class)->names([
        'index' => 'fund-transfer.index',
    ]);
    Route::apiResource('cash-mutations', CashMutationController::class)->names([
        'index' => 'cash-mutation.index',
    ]);
});
