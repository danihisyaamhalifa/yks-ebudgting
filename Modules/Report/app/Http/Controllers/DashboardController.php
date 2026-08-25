<?php

namespace Modules\Report\Http\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\Budget\Models\BudgetRequestHeader;
use Modules\Disbursement\Models\BudgetAccountability;
use Modules\Disbursement\Models\BudgetDisbursementHeader;
use Modules\Disbursement\Models\BudgetFundRelease;

class DashboardController extends Controller
{
    public function index()
    {
        $currentYear = Carbon::now()->year;

        // 1. QUERY AGREGASI RINGKASAN DATA (Menggabungkan semua fungsi SUM/COUNT transaksional tahun berjalan)
        // Menggunakan standard PDO bindings untuk keamanan dan performa maksimal
        $summaryData = DB::select("
            SELECT 
                -- Ringkasan Anggaran (Berdasarkan tahun berjalan)
                SUM(CASE WHEN source = 'request' AND status = 'approved' AND YEAR(target_date) = :year1 THEN amount ELSE 0 END) as total_proposed,
                SUM(CASE WHEN source = 'disbursement' AND status = 'approved' AND YEAR(target_date) = :year2 THEN amount ELSE 0 END) as total_disbursement,
                SUM(CASE WHEN source = 'release' AND status = 'transferred' AND YEAR(target_date) = :year3 THEN amount ELSE 0 END) as total_released,
                SUM(CASE WHEN source = 'accountability' AND status = 'approved' AND YEAR(target_date) = :year4 THEN amount ELSE 0 END) as total_spent,
                SUM(CASE WHEN source = 'accountability' AND status = 'approved' AND YEAR(target_date) = :year5 THEN amount_returned ELSE 0 END) as total_returned,

                -- Status Pending Total (Tanpa batas tahun untuk counter task management)
                COUNT(CASE WHEN source = 'request' AND status = 'submitted' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN source = 'disbursement' AND status = 'submitted' THEN 1 END) as pending_disbursements,
                COUNT(CASE WHEN source = 'accountability' AND status = 'submitted' THEN 1 END) as pending_spj,
                COUNT(CASE WHEN source = 'release' AND status = 'pending' THEN 1 END) as pending_releases
            FROM (
                SELECT 'request' as source, status, request_date as target_date, total_amount as amount, 0 as amount_returned FROM budget_request_headers
                UNION ALL
                SELECT 'disbursement' as source, status, disbursement_date as target_date, total_amount as amount, 0 as amount_returned FROM budget_disbursement_headers
                UNION ALL
                SELECT 'release' as source, status, fund_release_date as target_date, total_amount as amount, 0 as amount_returned FROM budget_fund_releases
                UNION ALL
                SELECT 'accountability' as source, status, accountability_date as target_date, total_spent as amount, total_returned as amount_returned FROM budget_accountabilities
            ) as combined_dashboard
        ", [
            'year1' => $currentYear,
            'year2' => $currentYear,
            'year3' => $currentYear,
            'year4' => $currentYear,
            'year5' => $currentYear,
        ])[0];

        // 2. Kalkulasi Nilai Finansial
        $totalProposed     = (float) ($summaryData->total_proposed ?? 0);
        $totalApproved     = $totalProposed; // Sesuai dengan logic awal Anda
        $totalDisbursement = (float) ($summaryData->total_disbursement ?? 0);
        $totalTransferred  = 0; // Placeholder sesuai code awal Anda
        $totalReleased     = (float) ($summaryData->total_released ?? 0);
        $totalSpent        = (float) ($summaryData->total_spent ?? 0);
        $totalReturned     = (float) ($summaryData->total_returned ?? 0);
        $sisaDana          = $totalReleased - ($totalSpent + $totalReturned);

        return Inertia::render('Dashboard', [
            'ringkasan_anggaran' => [
                'total_diusulkan'           => $totalProposed,
                'total_disetujui'           => $totalApproved,
                'total_pengajuan_pencairan' => $totalDisbursement,
                'total_ditransfer'          => $totalTransferred,
                'total_direalisasi'         => $totalReleased,
                'total_dipakai'             => $totalSpent,
                'total_dikembalikan'        => $totalReturned,
                'sisa_dana'                 => $sisaDana,
            ],
            'pending' => [
                'pengajuan_anggaran'  => (int) ($summaryData->pending_requests ?? 0),
                'pengajuan_pencairan' => (int) ($summaryData->pending_disbursements ?? 0),
                'transfer_dana'       => 0, // Placeholder
                'realisasi_pencairan' => (int) ($summaryData->pending_releases ?? 0),
                'pertanggungjawaban'  => (int) ($summaryData->pending_spj ?? 0),
            ],
        ]);
    }
}