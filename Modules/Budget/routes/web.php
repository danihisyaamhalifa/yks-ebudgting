<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/perencanaan-anggaran', function () {
        return Inertia::render(component: 'budget/request/Index');
    })->name('budget.request');

    Route::get('/perencanaan-anggaran/input', function () {
        return Inertia::render(component: 'budget/request/Input');
    })->name('budget.request.create');

    Route::get('/perencanaan-anggaran/{id}/edit', function ($id) {
        return Inertia::render('budget/request/Input', [
            'id' => $id
        ]);
    })->name('budget.request.edit');

    
    Route::get('/perencanaan-anggaran/{id}/view', function ($id) {
        return Inertia::render('budget/request/View', [
            'id' => $id
        ]);
    })->name('budget.request.view');

    Route::get('/verifikasi-anggaran', function () {
        return Inertia::render(component: 'budget/verification/Index');
    })->name('budget.verification');

    Route::get('/verifikasi-anggaran/{id}/verify', function ($id) {
        return Inertia::render('budget/verification/Verify', [
            'id' => $id
        ]);
    })->name('budget.request.verify');


    Route::get('/pagu-anggaran', function () {
        return Inertia::render(component: 'budget/allocated/Index');
    })->name('budget.allocated');

    Route::get('/laporan-keuangan', function () {
        return Inertia::render(component: 'report/Index');
    })->name('repor.cash-bank-ledger');
});
