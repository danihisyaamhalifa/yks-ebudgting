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
        $currentMonth = Carbon::now()->month;

        // Ringkasan Anggaran
        $totalProposed = BudgetRequestHeader::whereYear('request_date', $currentYear)
            ->whereIn('status', ['approved'])
            ->sum('total_amount');

        // $totalApproved = DB::table('budget_request_revisions')
        //     ->where('status', 'approved')
        //     ->whereYear('created_at', $currentYear)
        //     ->sum('total_amount');

        $totalApproved = $totalProposed;

        $totalDisbursement = BudgetDisbursementHeader::where('status', 'approved')
            ->whereYear('disbursement_date', $currentYear)
            ->sum('total_amount');

        $totalTransferred = 0;
        // BudgetFundTransfer::where('status', 'verified')
        //     ->whereYear('transfer_date', $currentYear)
        //     ->sum('total_amount');

        $totalReleased = BudgetFundRelease::where('status', 'transferred')
            ->whereYear('fund_release_date', $currentYear)
            ->sum('total_amount');

        $totalSpent = BudgetAccountability::where('status', 'approved')
            ->whereYear('accountability_date', $currentYear)
            ->sum('total_spent');

        $totalReturned = BudgetAccountability::where('status', 'approved')
            ->whereYear('accountability_date', $currentYear)
            ->sum('total_returned');

        // Status Counts
        $pendingRequests = BudgetRequestHeader::where('status', 'submitted')->count();
        $pendingDisbursements = BudgetDisbursementHeader::where('status', 'submitted')->count();
        $pendingTransfers = 0; //BudgetFundTransfer::where('status', 'submitted')->count();
        $pendingSPJ = BudgetAccountability::where('status', 'submitted')->count();
        $pendingReleases = BudgetFundRelease::where('status', 'pending')->count();

        // return response()->json([
        //     'success' => true,
        //     'data' => [
        //     'ringkasan_anggaran' => [
        //         'total_diusulkan' => $totalProposed,
        //         'total_disetujui' => $totalApproved,
        //         'total_pengajuan_cair' => $totalDisbursement,
        //         'total_ditransfer' => $totalTransferred,
        //         'total_direalisasi' => $totalReleased,
        //         'total_dipakai' => $totalSpent,
        //         'total_dikembalikan' => $totalReturned,
        //         'sisa_dana' => $totalReleased - ($totalSpent + $totalReturned),
        //     ],
        //     'pending' => [
        //         'pengajuan_anggaran' => $pendingRequests,
        //         'pengajuan_pencairan' => $pendingDisbursements,
        //         'transfer_dana' => $pendingTransfers,
        //         'realisasi_pencairan' => $pendingReleases,
        //         'pertanggungjawaban' => $pendingSPJ,
        //     ],
        // ],
        // ]);

        return Inertia::render('Dashboard', [
            'ringkasan_anggaran' => [
                'total_diusulkan' => $totalProposed,
                'total_disetujui' => $totalApproved,
                'total_pengajuan_pencairan' => $totalDisbursement,
                'total_ditransfer' => $totalTransferred,
                'total_direalisasi' => $totalReleased,
                'total_dipakai' => $totalSpent,
                'total_dikembalikan' => $totalReturned,
                'sisa_dana' => $totalReleased - ($totalSpent + $totalReturned),
            ],
            'pending' => [
                'pengajuan_anggaran' => $pendingRequests,
                'pengajuan_pencairan' => $pendingDisbursements,
                'transfer_dana' => $pendingTransfers,
                'realisasi_pencairan' => $pendingReleases,
                'pertanggungjawaban' => $pendingSPJ,
            ],
        ]);
    }
}
