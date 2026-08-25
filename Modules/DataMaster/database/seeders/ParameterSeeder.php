<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Modules\DataMaster\Models\Parameter;
use Modules\DataMaster\Models\ParameterValue;

class ParameterSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        DB::table('parameter_values')->truncate();
        DB::table('parameters')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->seedBudgetTypes();
        $this->seedUnitCategories();
        $this->seedActivityUnits();
    }

    private function seedBudgetTypes(): void
    {
        $parameter = Parameter::firstOrCreate(
            ['group_code' => 'BUDGET_TYPE'],
            [
                'group_name' => 'Jenis Anggaran',
                'description' => 'Klasifikasi jenis anggaran',
                'is_active' => true,
            ]
        );

        $values = [
            ['code' => 'BUDGETER', 'name' => 'Budgeter', 'sort_order' => 1],
            ['code' => 'NONBUDGETER', 'name' => 'Non Budgeter', 'sort_order' => 2],
        ];

        foreach ($values as $value) {
            ParameterValue::firstOrCreate(
                [
                    'parameter_id' => $parameter->id,
                    'code' => $value['code'],
                ],
                $value + ['is_active' => true]
            );
        }
    }

    private function seedUnitCategories(): void
    {
        $parameter = Parameter::firstOrCreate(
            ['group_code' => 'UNIT_CATEGORY'],
            [
                'group_name' => 'Kategori Unit',
                'description' => 'Klasifikasi kategori unit',
                'is_active' => true,
            ]
        );

        $values = [
            ['code' => 'UNIT', 'name' => 'Unit Kerja', 'sort_order' => 1],
            ['code' => 'BIRO', 'name' => 'Biro', 'sort_order' => 2],
            ['code' => 'PRODI', 'name' => 'Program Studi', 'sort_order' => 3],
        ];

        foreach ($values as $value) {
            ParameterValue::firstOrCreate(
                [
                    'parameter_id' => $parameter->id,
                    'code' => $value['code'],
                ],
                $value + ['is_active' => true]
            );
        }
    }

    private function seedActivityUnits(): void
    {
        $parameter = Parameter::firstOrCreate(
            ['group_code' => 'ACTIVITY_UNIT'],
            [
                'group_name' => 'Satuan Kegiatan',
                'description' => 'Satuan perhitungan volume kegiatan',
                'is_active' => true,
            ]
        );

        $values = [
            ['code' => 'ORANG', 'name' => 'Orang', 'sort_order' => 1],
            ['code' => 'HARI', 'name' => 'Hari', 'sort_order' => 2],
            ['code' => 'JAM', 'name' => 'Jam', 'sort_order' => 3],
            ['code' => 'PAKET', 'name' => 'Paket', 'sort_order' => 4],
            ['code' => 'UNIT', 'name' => 'Unit', 'sort_order' => 5],
            ['code' => 'KEGIATAN', 'name' => 'Kegiatan', 'sort_order' => 6],
        ];

        foreach ($values as $value) {
            ParameterValue::firstOrCreate(
                [
                    'parameter_id' => $parameter->id,
                    'code' => $value['code'],
                ],
                $value + ['is_active' => true]
            );
        }
    }

    
}
