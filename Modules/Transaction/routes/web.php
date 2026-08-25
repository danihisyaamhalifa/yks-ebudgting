<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/transfer-dana', function () {
        return Inertia::render(component: 'transaction/fund-transfer/Index');
    })->name('transaction.fundtransfer.index');

    Route::get('/mutasi-kas', function () {
        return Inertia::render(component: 'transaction/cash-mutation/Index');
    })->name('transaction.cashmutation.index');
});

