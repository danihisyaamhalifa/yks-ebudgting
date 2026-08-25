<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\DataMaster\Models\Coa;

class CoaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // $asset = Coa::updateOrCreate(
        //     ['account_code' => '1000'],
        //     [
        //         'account_name' => 'ASET',
        //         'account_type' => 'AKTIVA',
        //         'level' => 1,
        //         'normal_balance' => 'DEBIT',
        //         'is_header' => true,
        //     ]
        // );

        // $liability = Coa::updateOrCreate(
        //     ['account_code' => '2000'],
        //     [
        //         'account_name' => 'KEWAJIBAN',
        //         'account_type' => 'KEWAJIBAN',
        //         'level' => 1,
        //         'normal_balance' => 'KREDIT',
        //         'is_header' => true,
        //     ]
        // );

        // $equity = Coa::updateOrCreate(
        //     ['account_code' => '3000'],
        //     [
        //         'account_name' => 'MODAL',
        //         'account_type' => 'MODAL',
        //         'level' => 1,
        //         'normal_balance' => 'KREDIT',
        //         'is_header' => true,
        //     ]
        // );

        // $income = Coa::updateOrCreate(
        //     ['account_code' => '4000'],
        //     [
        //         'account_name' => 'PENDAPATAN',
        //         'account_type' => 'PENDAPATAN',
        //         'level' => 1,
        //         'normal_balance' => 'KREDIT',
        //         'is_header' => true,
        //     ]
        // );

        $expense = Coa::updateOrCreate(
            ['account_code' => '5000'],
            [
                'account_name' => 'BEBAN',
                'account_type' => 'BEBAN',
                'level' => 1,
                'normal_balance' => 'DEBIT',
                'is_header' => true,
            ]
        );

        // 2. Data Child yang ingin dimasukkan
        $children = [
            ['account_code' => '51101', 'account_name' => 'Honorarium Dosen'],
            ['account_code' => '51102', 'account_name' => 'Honorarium Tenaga Ahli'],
            ['account_code' => '51103', 'account_name' => 'Honorarium Pemateri'],
            ['account_code' => '51201', 'account_name' => 'Biaya Perjalanan Dinas'],
            ['account_code' => '51202', 'account_name' => 'Transportasi Lokal'],
            ['account_code' => '51301', 'account_name' => 'Konsumsi Rapat'],
            ['account_code' => '51302', 'account_name' => 'Konsumsi Seminar'],
            ['account_code' => '51401', 'account_name' => 'Sewa Ruangan'],
            ['account_code' => '51402', 'account_name' => 'Sewa Peralatan'],
            ['account_code' => '51501', 'account_name' => 'ATK'],
            ['account_code' => '51502', 'account_name' => 'Bahan Habis Pakai'],
            ['account_code' => '51601', 'account_name' => 'Print dan Fotocopy'],
            ['account_code' => '51602', 'account_name' => 'Publikasi dan Iklan'],
            ['account_code' => '51701', 'account_name' => 'Internet dan Telepon'],
            ['account_code' => '51801', 'account_name' => 'Maintenance Komputer'],
        ];

        $this->seedChildren($expense, $children);
    }

    /**
     * Fungsi Helper untuk insert Children
     */
    private function seedChildren(Coa $parent, array $children): void
    {
        foreach ($children as $child) {
            Coa::updateOrCreate(
                ['account_code' => $child['account_code']],
                [
                    'account_name'   => $child['account_name'],
                    'account_type'   => $parent->account_type, // Otomatis ikut Parent
                    'parent_id'      => $parent->id,          // Otomatis link ke Parent
                    'level'          => $parent->level + 1,   // Otomatis level di bawah Parent
                    'normal_balance' => $parent->normal_balance, // Otomatis ikut Parent
                    'is_header'      => false,
                    'is_active'      => true,
                ]
            );
        }
    }
}
