<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\DataMaster\Models\Activity;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Definisikan Parent Utama (Misal: Header untuk FIKK)
        $parent = Activity::updateOrCreate(
            ['activity_code' => 'ACT-I'],
            [
                'activity_name'    => 'Pendidikan dan Pengajaran FIKK',
                'level'            => 1,
                'is_budgetable'    => false,
                'is_active'        => true,
                'budget_type_id'   => 1, 
            ]
        );

        // 2. Data dari Gambar
        $activities = [
            ['code' => '01', 'name' => 'Insentif Kegiatan Belajar Mengajar'],
            ['code' => '02', 'name' => 'Zoom PBM'],
            ['code' => '03', 'name' => 'PKK KD Tingkat I'],
            ['code' => '04', 'name' => 'PKK Maternitas, Anak dan Gadar TK II'],
            ['code' => '05', 'name' => 'Komprehensif KTI Tingkat III'],
            ['code' => '06', 'name' => 'Kuliah Pakar'],
            ['code' => '07', 'name' => 'Rapat Persiapan Pembelajaran Ganjil 2026/2027'],
            ['code' => '08', 'name' => 'Pembimbing Akademik'],
            ['code' => '09', 'name' => 'Kegiatan UTS'],
            ['code' => '10', 'name' => 'Kegiatan UAS'],
            ['code' => '11', 'name' => 'Kegiatan UAP'],
            ['code' => '12', 'name' => 'Kegiatan BTCLS'],
        ];

        // 3. Isikan menggunakan fungsi helper
        $this->seedActivityChildren($parent, $activities);
    }

    /**
     * Helper untuk insert children
     */
    private function seedActivityChildren(Activity $parent, array $children): void
    {
        foreach ($children as $child) {
            Activity::updateOrCreate(
                ['activity_code' => $parent->activity_code . '-' . $child['code']],
                [
                    'activity_name'    => $child['name'],
                    'parent_id'        => $parent->id,
                    'level'            => $parent->level + 1,
                    'budget_type_id'   => $parent->budget_type_id,
                    'is_budgetable'    => true,
                    'is_active'        => true,
                ]
            );
        }
    }
}
