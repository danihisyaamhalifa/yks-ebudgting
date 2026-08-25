<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\DataMaster\Models\BudgetCategory;

class BudgetCategorySeeder extends Seeder
{
    public function run(): void
    {
        // I. BEBAN PENDIDIKAN DAN PENGAJARAN FIKK
        $fikk = BudgetCategory::updateOrCreate(
            ['code' => 'I'],
            ['name' => 'BEBAN PENDIDIKAN DAN PENGAJARAN FIKK', 'level' => 1, 'sort_order' => 1, 'is_active' => true]
        );
        $this->seedChildren($fikk, [
            ['code' => 'I.1', 'name' => 'Kurikulum dan PBM D III Keperawatan', 'sort_order' => 1],
            ['code' => 'I.2', 'name' => 'Kurikulum dan PBM D III Kebidanan', 'sort_order' => 2],
            ['code' => 'I.3', 'name' => 'Kurikulum dan PBM S1 Keperawatan (Reguler + NR)', 'sort_order' => 3],
            ['code' => 'I.4', 'name' => 'Kurikulum dan PBM Profesi Ners', 'sort_order' => 4],
            ['code' => 'I.5', 'name' => 'Kurikulum dan PBM S1 Kebidanan', 'sort_order' => 5],
            ['code' => 'I.6', 'name' => 'Kurikulum dan PBM Profesi bidan', 'sort_order' => 6],
        ]);

        // II. BEBAN PENDIDIKAN DAN PENGAJARAN FIKes
        $fikes = BudgetCategory::updateOrCreate(
            ['code' => 'II'],
            ['name' => 'BEBAN PENDIDIKAN DAN PENGAJARAN FIKes', 'level' => 1, 'sort_order' => 2, 'is_active' => true]
        );
        $this->seedChildren($fikes, [
            ['code' => 'II.1', 'name' => 'Kurikulum dan PBM D3 TLM', 'sort_order' => 1],
            ['code' => 'II.2', 'name' => 'Kurikulum dan PBM D3 Farmasi', 'sort_order' => 2],
        ]);

        // III. BEBAN HABIS PAKAI PRAKTIKUM
        $bhp = BudgetCategory::updateOrCreate(
            ['code' => 'III'],
            ['name' => 'BEBAN HABIS PAKAI PRAKTIKUM', 'level' => 1, 'sort_order' => 3, 'is_active' => true]
        );
        $this->seedChildren($bhp, [
            ['code' => 'III.1', 'name' => 'BHP Praktikum D3 Kebidanan', 'sort_order' => 1],
            ['code' => 'III.2', 'name' => 'BHP Praktikum S1 Kebidanan', 'sort_order' => 2],
            ['code' => 'III.3', 'name' => 'BHP Praktikum TLM', 'sort_order' => 3],
            ['code' => 'III.4', 'name' => 'BHP Praktikum Farmasi', 'sort_order' => 4],
        ]);

        // IV. BEBAN KERJASAMA/MOU
        BudgetCategory::updateOrCreate(
            ['code' => 'IV'],
            ['name' => 'BEBAN KERJASAMA/MOU', 'level' => 1, 'sort_order' => 4, 'is_active' => true]
        );

        // V. BEBAN SUMBER DAYA MANUSIA (SDM)
        $sdm = BudgetCategory::updateOrCreate(
            ['code' => 'V'],
            ['name' => 'BEBAN SUMBER DAYA MANUSIA (SDM)', 'level' => 1, 'sort_order' => 5, 'is_active' => true]
        );
        $this->seedChildren($sdm, [
            ['code' => 'V.1', 'name' => 'Gaji Pegawai', 'sort_order' => 1],
            ['code' => 'V.2', 'name' => 'Beban Uang Kehadiran', 'sort_order' => 2],
            ['code' => 'V.3', 'name' => 'Beban BPJS Kesehatan', 'sort_order' => 3],
            ['code' => 'V.4', 'name' => 'Beban BPJS Ketenagakerjaan', 'sort_order' => 4],
            ['code' => 'V.5', 'name' => 'Beban Pendidikan Anak tahun 2026', 'sort_order' => 5],
            ['code' => 'V.6', 'name' => 'Beban Idul Adha tahun 2026', 'sort_order' => 6],
            ['code' => 'V.7', 'name' => 'Beban Pendidikan Pegawai', 'sort_order' => 7],
            ['code' => 'V.8', 'name' => 'Beban THR tahun 2026', 'sort_order' => 8],
        ]);

        // VI. BEBAN MANAJEMEN DAN UMUM (Di gambar tertulis III lagi, saya sesuaikan jadi VI agar unik)
        $umum = BudgetCategory::updateOrCreate(
            ['code' => 'VI'],
            ['name' => 'BEBAN MANAJEMEN DAN UMUM', 'level' => 1, 'sort_order' => 6, 'is_active' => true]
        );
        $this->seedChildren($umum, [
            ['code' => 'VI.1', 'name' => 'Rekening Listrik', 'sort_order' => 1],
            ['code' => 'VI.2', 'name' => 'Rekening PDAM', 'sort_order' => 2],
            ['code' => 'VI.3', 'name' => 'Fotocopy, Cetak, Jilid dll', 'sort_order' => 3],
            ['code' => 'VI.4', 'name' => 'Warta Garut', 'sort_order' => 4],
            ['code' => 'VI.5', 'name' => 'BBM', 'sort_order' => 5],
            ['code' => 'VI.6', 'name' => 'Kebersihan Kampus', 'sort_order' => 6],
            ['code' => 'VI.7', 'name' => 'Beban ATK untuk Kantor & Prodi', 'sort_order' => 7],
            ['code' => 'VI.8', 'name' => 'Beban Kebutuhan Rumah Tangga', 'sort_order' => 8],
            ['code' => 'VI.9', 'name' => 'Akomodasi (Mamin rapat, Olahraga, Tamu dll)', 'sort_order' => 9],
            ['code' => 'VI.10', 'name' => 'Sumbangan-sumbangan', 'sort_order' => 10],
            ['code' => 'VI.11', 'name' => 'Beban SPPD', 'sort_order' => 11],
        ]);
    }

    private function seedChildren(BudgetCategory $parent, array $children): void
    {
        foreach ($children as $child) {
            BudgetCategory::updateOrCreate(
                ['code' => $child['code']],
                [
                    'parent_id'  => $parent->id,
                    'name'       => $child['name'],
                    'level'      => $parent->level + 1,
                    'sort_order' => $child['sort_order'],
                    'is_active'  => true,
                ]
            );
        }
    }
}
