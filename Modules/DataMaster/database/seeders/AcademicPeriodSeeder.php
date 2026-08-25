<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\DataMaster\Models\AcademicPeriod;

class AcademicPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    { {
            $periods = [
                [
                    'academic_year' => '2024/2025',
                    'semester' => 'ganjil',
                    'start_date' => '2024-08-01',
                    'end_date' => '2025-01-31',
                    'description' => 'Semester Ganjil 2024/2025',
                    'is_active' => false,
                ],
                [
                    'academic_year' => '2024/2025',
                    'semester' => 'genap',
                    'start_date' => '2025-02-01',
                    'end_date' => '2025-07-31',
                    'description' => 'Semester Genap 2024/2025',
                    'is_active' => false,
                ],
                [
                    'academic_year' => '2025/2026',
                    'semester' => 'ganjil',
                    'start_date' => '2025-08-01',
                    'end_date' => '2026-01-31',
                    'description' => 'Semester Ganjil 2025/2026',
                    'is_active' => true,
                ],
            ];

            foreach ($periods as $period) {
                AcademicPeriod::create($period);
            }
        }
    }
}
