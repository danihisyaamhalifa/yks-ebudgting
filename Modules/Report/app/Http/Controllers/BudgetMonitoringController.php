<?php

namespace Modules\Report\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\Budget\Models\BudgetRequestItem;
use Modules\DataMaster\Models\ActivityItem;
use Modules\Disbursement\Models\BudgetDisbursementItem;
use Modules\Disbursement\Models\BudgetFundReleaseItem;
use Modules\Disbursement\Models\BudgetAccountability;

class BudgetMonitoringController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('report/budget-monitoring/Index');
    }

    public function data(Request $request)
    {
        $query = $this->buildBaseQuery($request);

        if ($request->filled('sort_by')) {
            $sortOrder = $request->sort_order ?? 'asc';

            $sortColumnMap = [
                'item_code'        => 'activity_items.item_code',
                'item_name'        => 'activity_items.item_name',
                'pagu_disetujui'   => 'pagu.total_pagu',
                'diajukan'         => 'diajukan.total_diajukan',
                'dicairkan'        => 'dicairkan.total_dicairkan',

                // PERBAIKAN SORTING: Disinkronkan dengan variabel spj yang baru
                'direalisasikan'    => 'spj.direalisasikan',
                'total_kembali'    => 'spj.total_dikembalikan',

                // Sisa Pagu = Pagu Disetujui - Total Dipakai SPJ
                'sisa_pagu'        => DB::raw('(COALESCE(pagu.total_pagu, 0) - COALESCE(spj.direalisasikan, 0))'),

                // Selisih Dana Pengajuan = Dicairkan - (Total Dipakai + Total Dikembalikan)
                'selisih_realisasi_pengajuan' => DB::raw('(COALESCE(diajukan.total_diajukan, 0) - (COALESCE(dicairkan.total_dicairkan, 0)))'),

                // Selisih Dana Pencairan = Dicairkan - (Total Dipakai + Total Dikembalikan)
                'selisih_realisasi_pencairan' => DB::raw('(COALESCE(dicairkan.total_dicairkan, 0) - (COALESCE(spj.direalisasikan, 0) + COALESCE(spj.total_dikembalikan, 0)))'),
            ];

            if (isset($sortColumnMap[$request->sort_by])) {
                // Gunakan orderByRaw jika target sorting berupa DB::raw expression
                if ($sortColumnMap[$request->sort_by] instanceof \Illuminate\Contracts\Database\Query\Expression) {
                    $query->orderByRaw($sortColumnMap[$request->sort_by] . " " . $sortOrder);
                } else {
                    $query->orderBy($sortColumnMap[$request->sort_by], $sortOrder);
                }
            }
        }

        $perPage = $request->per_page ?? 10;
        $page = $request->page ?? 1;

        $items = $query->paginate($perPage, ['*'], 'page', $page);

        // Format data response untuk frontend
        $results = $items->getCollection()->map(function ($item) {
            $paguDisetujui    = (float) $item->pagu_disetujui;
            $diajukan         = (float) $item->diajukan;
            $dicairkan        = (float) $item->dicairkan;

            $dipakaiSpj       = (float) $item->dipake_spj; // Riil belanja di lapangan
            $dikembalikanSpj  = (float) $item->dikembalikan_spj; // Sisa kas riil yang dibalikkin

            // Kalkulasi sisa dana dari pagu awal terhadap realisasi belanja lapangan
            $sisaPagu         = $paguDisetujui - $dipakaiSpj;

             // Kalkulasi sisa dana di tangan pengaju (dana diajukan vs dicairkan)
            $selisihDanaPengajuan   = $diajukan - $dicairkan;

            // Kalkulasi sisa dana di tangan pelaksana (dana cair vs belanja + kembalian)
            $selisihDanaPencairan   = $dicairkan - ($dipakaiSpj + $dikembalikanSpj);

            $jumlahSelisih   = $selisihDanaPengajuan + $selisihDanaPencairan;

            return [
                'id'               => $item->id,
                'item_code'        => $item->item_code,
                'item_name'        => $item->item_name,
                'estimation_price' => number_format($item->estimation_price ?? 0, 2, ',', '.'),
                'pagu_disetujui'   => number_format($paguDisetujui, 2, ',', '.'),
                'diajukan'         => number_format($diajukan, 2, ',', '.'),
                'dicairkan'        => number_format($dicairkan, 2, ',', '.'),
                'direalisasikan'    => number_format($dipakaiSpj, 2, ',', '.'),
                'total_kembali'    => number_format($dikembalikanSpj, 2, ',', '.'),
                'sisa_pagu'        => number_format($sisaPagu, 2, ',', '.'),
                'selisih_realisasi_pengajuan' => number_format($selisihDanaPengajuan, 2, ',', '.'),
                'selisih_realisasi_pencairan' => number_format($selisihDanaPencairan, 2, ',', '.'),
                'jumlah_selisih_realisasi' => number_format($jumlahSelisih, 2, ',', '.'),
            ];
        });

        return response()->json([
            'data'         => $results,
            'current_page' => $items->currentPage(),
            'per_page'     => $items->perPage(),
            'total'        => $items->total(),
            'last_page'    => $items->lastPage(),
        ]);
    }

    public function summary(Request $request)
    {
        $items = $this->buildBaseQuery($request)->get();

        $totalPagu         = $items->sum('pagu_disetujui');
        $totalDiajukan     = $items->sum('diajukan');
        $totalDicairkan    = $items->sum('dicairkan');

        $totalDipakaiSpj   = $items->sum('dipake_spj');
        $totalKembaliSpj   = $items->sum('dikembalikan_spj');

        $totalRealisasi    = $totalDipakaiSpj;
        $totalSisaPagu     = $totalPagu - $totalRealisasi;

        $totalSelisihDanaPengajuan  = $totalDiajukan - $totalDicairkan;
        $totalSelisihDanaPencairan  = $totalDicairkan - ($totalDipakaiSpj + $totalKembaliSpj);
        $totalJumlahSelisih  = $totalSelisihDanaPengajuan + $totalSelisihDanaPencairan;

        return response()->json([
            'data' => [
                'total_pagu'                 => number_format($totalPagu, 2, ',', '.'),
                'total_diajukan'             => number_format($totalDiajukan, 2, ',', '.'),
                'total_dicairkan'            => number_format($totalDicairkan, 2, ',', '.'),
                'direalisasikan_spj'          => number_format($totalDipakaiSpj, 2, ',', '.'),
                'total_dikembalikan_spj'     => number_format($totalKembaliSpj, 2, ',', '.'),
                'total_direalisasikan'       => number_format($totalRealisasi, 2, ',', '.'),
                'total_sisa_pagu'            => number_format($totalSisaPagu, 2, ',', '.'),
                'total_selisih_dana_pengajuan' => number_format($totalSelisihDanaPengajuan, 2, ',', '.'),
                'total_selisih_dana_pencairan' => number_format($totalSelisihDanaPencairan, 2, ',', '.'),
                'total_jumlah_selisih' => number_format($totalJumlahSelisih, 2, ',', '.'),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $items = $this->buildBaseQuery($request)->get();

        $exportData = $items->map(function ($item) {
            $paguDisetujui    = (float) $item->pagu_disetujui;
            $diajukan         = (float) $item->diajukan;
            $dicairkan        = (float) $item->dicairkan;

            // Membaca data baru hasil mapping SPJ
            $dipakaiSpj       = (float) $item->dipake_spj;
            $dikembalikanSpj  = (float) $item->dikembalikan_spj;

            // Penyesuaian Rumus Finansial Baru
            $realisasi        = $dipakaiSpj; // Realisasi riil belanja lapangan
            $sisaPagu         = $paguDisetujui - $realisasi; // Sisa pagu anggaran instansi

            // Selisih holding dana pelaksana lapangan (Uang di tangan yang belum di-SPJ-kan/dikembalikan)
            $selisihDanaSpj   = $dicairkan - ($dipakaiSpj + $dikembalikanSpj);

            return [
                'Kode Item'               => $item->item_code,
                'Nama Item'               => $item->item_name,
                'Pagu Disetujui'          => $paguDisetujui,
                'Diajukan'                => $diajukan,
                'Dicairkan (Drop Dana)'   => $dicairkan,
                'Total Dipakai (SPJ)'     => $dipakaiSpj,
                'Total Dikembalikan Kas'  => $dikembalikanSpj,
                'Realisasi Riil Belanja'  => $realisasi,
                'Sisa Pagu Anggaran'      => $sisaPagu,
                'Selisih Sisa Kas Lapangan' => $selisihDanaSpj,
            ];
        });

        $filename = 'laporan_monitoring_anggaran_' . date('Y-m-d') . '.csv';
        $handle   = fopen('php://temp', 'w+');

        // Tulis header kolom CSV
        fputcsv($handle, array_keys($exportData->first() ?? []));

        // Tulis baris data
        foreach ($exportData as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return response($content, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function transactions(Request $request, $id)
    {
        $type = $request->type;
        ActivityItem::findOrFail($id); // Validasi ID ada atau tidak

        switch ($type) {
            case 'budget_request':
                $items = BudgetRequestItem::where('activity_item_id', $id)
                    ->with(['requestActivity.requestHeader'])
                    ->latest()
                    ->get();

                return response()->json(['data' => $items->map(fn($item) => [
                    'id'           => $item->id,
                    'type'         => 'budget_request',
                    'title'        => 'Perencanaan Anggaran',
                    'reference_no' => $item->requestActivity?->requestHeader?->request_no,
                    'date'         => $item->created_at,
                    'amount'       => (float) $item->total_amount,
                    'status'       => $item->requestActivity?->requestHeader?->status ?? 'draft',
                    'description'  => $item->description ?? 'Perencanaan anggaran untuk item ini',
                    'quantity'     => $item->volume ?? 0,
                    'price'        => $item->unit_price ?? 0,
                    'unit_name'    => $item->requestActivity?->requestHeader?->unit?->unit_name ?? 'N/A'
                ])]);

            case 'disbursement':
                $items = BudgetDisbursementItem::select('budget_disbursement_items.*')
                    ->join('budget_request_items as bri', 'budget_disbursement_items.budget_request_item_id', '=', 'bri.id')
                    ->where('bri.activity_item_id', $id)
                    ->with(['budgetDisbursementHeader'])
                    ->latest()
                    ->get();

                return response()->json(['data' => $items->map(fn($item) => [
                    'id'           => $item->id,
                    'type'         => 'disbursement',
                    'title'        => 'Pengajuan Pencairan',
                    'reference_no' => $item->budgetDisbursementHeader?->disbursement_no,
                    'date'         => $item->created_at,
                    'amount'       => (float) $item->total_amount,
                    'status'       => $item->budgetDisbursementHeader?->status ?? 'draft',
                    'description'  => $item->notes ?? 'Pengajuan pencairan dana',
                    'quantity'     => 1, // Di ERD budget_disbursement_items tidak ada kolom quantity/volume
                    'price'        => (float) $item->total_amount,
                ])]);

            case 'fund_release':
                $items = BudgetFundReleaseItem::select('budget_fund_release_items.*')
                    ->join('budget_disbursement_items as bdi', 'budget_fund_release_items.budget_disbursement_item_id', '=', 'bdi.id')
                    ->join('budget_request_items as bri', 'bdi.budget_request_item_id', '=', 'bri.id')
                    ->where('bri.activity_item_id', $id)
                    ->with(['budgetFundRelease']) // Pastikan nama relasi ke parent header di model sudah sesuai
                    ->latest()
                    ->get();

                return response()->json(['data' => $items->map(fn($item) => [
                    'id'           => $item->id,
                    'type'         => 'fund_release',
                    'title'        => 'Realisasi Pencairan',
                    'reference_no' => $item->budgetFundRelease?->fund_release_no, // Mengikuti kolom 'fund_release_no' di model Anda
                    'date'         => $item->created_at,
                    'amount'       => (float) $item->total_amount,
                    'status'       => $item->budgetFundRelease?->status ?? 'draft',
                    'description'  => $item->notes ?? 'Realisasi pencairan dana',
                    'quantity'     => 1,
                    'price'        => (float) $item->total_amount,
                ])]);

                // TAMBAHAN BARU: Case untuk history pertanggungjawaban (SPJ)
            case 'accountability':
                $items = BudgetAccountability::select('budget_accountabilities.*')
                    ->join('budget_fund_release_items as bfri', 'budget_accountabilities.budget_fund_release_item_id', '=', 'bfri.id')
                    ->join('budget_disbursement_items as bdi', 'bfri.budget_disbursement_item_id', '=', 'bdi.id')
                    ->join('budget_request_items as bri', 'bdi.budget_request_item_id', '=', 'bri.id')
                    ->where('bri.activity_item_id', $id)
                    ->latest('budget_accountabilities.accountability_date')
                    ->get();

                return response()->json(['data' => $items->map(fn($item) => [
                    'id'           => $item->id,
                    'type'         => 'accountability',
                    'title'        => 'Pertanggungjawaban (SPJ)',
                    'reference_no' => $item->accountability_no,
                    'date'         => $item->accountability_date,
                    'amount'       => (float) $item->total_spent, // Nilai belanja riil lapangan
                    'status'       => $item->status ?? 'draft',
                    'description'  => $item->notes ?? 'Laporan pertanggungjawaban penggunaan dana',
                    'quantity'     => 1,
                    'price'        => (float) $item->total_spent,
                    // Meta info tambahan khusus SPJ jika frontend membutuhkan data refund kas
                    'meta'         => [
                        'total_received' => (float) $item->total_received,
                        'total_returned' => (float) $item->total_returned,
                    ]
                ])]);

            default:
                return response()->json(['data' => []]);
        }
    }

    /**
     * Private helper method untuk membangun query inti (Base Query).
     */
    private function buildBaseQuery(Request $request)
    {
        // 1. Subquery Hitung Pagu Approved per item
        $paguSub = DB::table('budget_request_items as bri')
            ->join('budget_request_activities as bra', 'bri.budget_request_activity_id', '=', 'bra.id')
            ->join('budget_request_headers as brh', 'bra.budget_request_header_id', '=', 'brh.id')
            ->where('brh.status', 'approved')
            ->select('bri.activity_item_id', DB::raw('SUM(bri.total_amount) as total_pagu'))
            ->groupBy('bri.activity_item_id');

        // 2. Subquery Hitung Diajukan per item
        $diajukanSub = DB::table('budget_disbursement_items as bdi')
            ->join('budget_request_items as bri', 'bdi.budget_request_item_id', '=', 'bri.id')
            ->join('budget_disbursement_headers as bdh', 'bdi.budget_disbursement_header_id', '=', 'bdh.id')

            ->whereIn('bdh.status', ['submitted', 'approved'])
            ->select('bri.activity_item_id', DB::raw('SUM(bdi.total_amount) as total_diajukan'))
            ->groupBy('bri.activity_item_id');

        // 3. Subquery Hitung Dicairkan per item
        $dicairkanSub = DB::table('budget_fund_release_items as bfri')
            ->join('budget_fund_releases as bfr', 'bfri.budget_fund_release_id', '=', 'bfr.id')
            ->join('budget_disbursement_items as bdi', 'bfri.budget_disbursement_item_id', '=', 'bdi.id')
            ->join('budget_request_items as bri', 'bdi.budget_request_item_id', '=', 'bri.id')

            ->where('bfr.status', 'transferred')
            ->select('bri.activity_item_id', DB::raw('SUM(bfri.total_amount) as total_dicairkan'))
            ->groupBy('bri.activity_item_id');

        // 4. Subquery Hitung realisasi per item
        $realisasiSpjSub = DB::table('budget_accountabilities as ba')
            ->join('budget_fund_release_items as bfri', 'ba.budget_fund_release_item_id', '=', 'bfri.id')
            ->join('budget_disbursement_items as bdi', 'bfri.budget_disbursement_item_id', '=', 'bdi.id')
            ->join('budget_request_items as bri', 'bdi.budget_request_item_id', '=', 'bri.id')
            ->whereIn('ba.status', ['submitted', 'approved'])
            ->select(
                'bri.activity_item_id',
                DB::raw('SUM(ba.total_spent) as direalisasikan'),
                DB::raw('SUM(ba.total_returned) as total_dikembalikan')
            )
            ->groupBy('bri.activity_item_id');

        // 4. Integrasikan ke Main Query
        $query = ActivityItem::query()
            ->select([
                'activity_items.id',
                'activity_items.item_code',
                'activity_items.item_name',
                'activity_items.estimation_price',
                DB::raw('COALESCE(pagu.total_pagu, 0) as pagu_disetujui'),
                DB::raw('COALESCE(diajukan.total_diajukan, 0) as diajukan'),
                DB::raw('COALESCE(dicairkan.total_dicairkan, 0) as dicairkan'),
                DB::raw('COALESCE(spj.direalisasikan, 0) as dipake_spj'),
                DB::raw('COALESCE(spj.total_dikembalikan, 0) as dikembalikan_spj'),
            ])
            ->leftJoinSub($paguSub, 'pagu', 'activity_items.id', '=', 'pagu.activity_item_id')
            ->leftJoinSub($diajukanSub, 'diajukan', 'activity_items.id', '=', 'diajukan.activity_item_id')
            ->leftJoinSub($dicairkanSub, 'dicairkan', 'activity_items.id', '=', 'dicairkan.activity_item_id')
            ->leftJoinSub($realisasiSpjSub, 'spj', 'activity_items.id', '=', 'spj.activity_item_id')
            ->where('activity_items.is_active', true);

        // Filter biasa
        if ($request->filled('item_code')) {
            $query->where('activity_items.item_code', 'like', "%{$request->item_code}%");
        }

        // if ($request->filled('unit_id')) {
        //     $query->where('activity_items.unit_id', $request->unit_id);
        // }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('activity_items.item_code', 'like', "%{$search}%")
                    ->orWhere('activity_items.item_name', 'like', "%{$search}%");
            });
        }

        // Filter sisa (sekarang menggunakan WHERE biasa karena subquery bukan lagi fungsi GROUP BY global)
        if ($request->filled('min_sisa')) {
            $query->whereRaw('(COALESCE(pagu.total_pagu, 0) - COALESCE(dicairkan.total_dicairkan, 0)) >= ?', [$request->min_sisa]);
        }

        if ($request->filled('max_sisa')) {
            $query->whereRaw('(COALESCE(pagu.total_pagu, 0) - COALESCE(dicairkan.total_dicairkan, 0)) <= ?', [$request->max_sisa]);
        }

        return $query;
    }
}
