<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(
    function () {
        Route::get('/parameter', function () {
            return Inertia::render(component: 'admin/parameters/Index');
        })->name('admin.parameters');
        
        Route::get('/unit', function () {
            return Inertia::render(component: 'masterdata/unit/Index');
        })->name('datamaster.units');

        Route::get('/coa', function () {
            return Inertia::render(component: 'masterdata/coa/Index');
        })->name('datamaster.coas');

        Route::get('/tahun-anggaran', function () {
            return Inertia::render(component: 'masterdata/fiscal-year/Index');
        })->name('datamaster.fiscal-years');

        Route::get('/periode-akademik', function () {
            return Inertia::render(component: 'masterdata/academic-period/Index');
        })->name('datamaster.academic-periods');

        Route::get('/kegiatan', function () {
            return Inertia::render(component: 'masterdata/activity/Index');
        })->name('datamaster.activities');

        Route::get('/kategori-anggaran', function () {
            return Inertia::render(component: 'masterdata/budget-category/Index');
        })->name('datamaster.budget-categories');

        Route::get('/sub-kategori-anggaran', function () {
            return Inertia::render(component: 'masterdata/budget-category/sub/Index');
        })->name('datamaster.sub-budget-categories');

        Route::get('/kas-bank', function () {
            return Inertia::render(component: 'masterdata/cash-bank/Index');
        })->name('datamaster.cash-banks');

        Route::get('/sumber-dana', function () {
            return Inertia::render(component: 'masterdata/fund-source/Index');
        })->name('datamaster.fund-source');

        Route::get('/item-anggaran', function () {
            return Inertia::render(component: 'masterdata/activity-item/Index');
        })->name('datamaster.activity-item');

         Route::get('/pegawai', function () {
            return Inertia::render(component: 'masterdata/employee/Index');
        })->name('datamaster.employees');

        Route::get('/vendor', function () {
            return Inertia::render(component: 'masterdata/vendor/Index');
        })->name('datamaster.vendors');
    }
);
