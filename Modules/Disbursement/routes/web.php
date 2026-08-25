<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pengajuan-pencairan', function () {
        return Inertia::render(component: 'disbursement/request/Index');
    })->name('disbursement.request.index');

    Route::get('/pengajuan-pencairan/input', function () {
        return Inertia::render(component: 'disbursement/request/Input');
    })->name('disbursement.request');

    Route::get('/pengajuan-pencairan/{id}/edit', function ($id) {
        return Inertia::render('disbursement/request/Input', [
            'id' => $id
        ]);
    })->name('disbursement.request.edit');

    Route::get('/verifikasi-pengajuan', function () {
        return Inertia::render(component: 'disbursement/request/verification/Index');
    })->name('disbursement.request.verification');

    Route::get('/verifikasi-pengajuan/{id}/verify', function ($id) {
        return Inertia::render('disbursement/request/verification/Verify', [
            'id' => $id
        ]);
    })->name('disbursement.request.verify');

    Route::get('/disposisi-pencairan', function () {
        return Inertia::render(component: 'disbursement/fundrelease/disposition/Index');
    })->name('budget.fundrelease.disposition.index');

    Route::get('/disposisi-pencairan/input', function () {
        return Inertia::render(component: 'disbursement/fundrelease/disposition/Input');
    })->name('budget.fundrelease.disposition.input');

    Route::get('/disposisi-pencairan/{id}/{mode}', function ($id, $mode) {
        return Inertia::render('disbursement/fundrelease/disposition/Input', [
            'id' => $id,
            'mode' => $mode
        ]);
    })->name('budget.fundrelease.disposition.form');

    Route::get('/realisasi-pencairan', function () {
        return Inertia::render(component: 'disbursement/fundrelease/Index');
    })->name('budget.fundrelease.index');

    Route::get('/realisasi-pencairan/input', function () {
        return Inertia::render(component: 'disbursement/fundrelease/Input');
    })->name('budget.fundrelease.input');

    Route::get('/realisasi-pencairan/{id}/{mode}', function ($id, $mode) {
        return Inertia::render('disbursement/fundrelease/Input', [
            'id' => $id,
            'mode' => $mode
        ]);
    })->name('budget.fundrelease.form');

    Route::get('/verifikasi-realisasi-pencairan', function () {
        return Inertia::render(component: 'disbursement/fundrelease/verification/Index');
    })->name('budget.fundrelease.verification');

    Route::get('/verifikasi-realisasi-pencairan/{id}/verify', function ($id) {
        return Inertia::render('disbursement/fundrelease/verification/Verify', [
            'id' => $id
        ]);
    })->name('budget.fundrelease.verify');

    Route::get('/pertanggungjawaban', function () {
        return Inertia::render(component: 'disbursement/accountability/Index');
    })->name('budget.accountability.index');

    Route::get('/pertanggungjawaban/input', function () {
        return Inertia::render(component: 'disbursement/accountability/Input');
    })->name('budget.accountability.input');

    Route::get('/pertanggungjawaban/{id}/{mode}', function ($id, $mode) {
        return Inertia::render('disbursement/accountability/Input', [
            'id' => $id,
            'mode' => $mode
        ]);
    })->name('budget.accountability.edit');

    Route::get('/verifikasi-pertanggungjawaban', function () {
        return Inertia::render(component: 'disbursement/accountability/verification/Index');
    })->name('budget.accountability.verification');

    Route::get('/verifikasi-pertanggungjawaban/{id}/verify', function ($id) {
        return Inertia::render('disbursement/accountability/verification/Verify', [
            'id' => $id
        ]);
    })->name('budget.accountability.verify');
});
