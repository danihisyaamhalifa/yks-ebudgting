<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Modules\DataMaster\Models\Unit;
use Modules\DataMaster\Models\ParameterValue;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            $this->command->info('Memulai seeding units...');

            $prodi = $this->param('UNIT_CATEGORY', 'PRODI');

            $units = [
                // Program Studi
                [
                    'unit_code' => 'PR-001',
                    'unit_name' => 'S1 Ilmu Keperawatan',
                    'unit_category_id' => $prodi->id,
                    'is_active' => true,
                ],
                [
                    'unit_code' => 'PR-002',
                    'unit_name' => 'Pendidikan Profesi Ners',
                    'unit_category_id' => $prodi->id,
                    'is_active' => true,
                ],
            ];

            $created = 0;
            $skipped = 0;

            foreach ($units as $unit) {
                try {
                    $result = Unit::updateOrCreate(
                        ['unit_code' => $unit['unit_code']],
                        $unit
                    );

                    if ($result->wasRecentlyCreated) {
                        $created++;
                        $this->command->info("Created: {$unit['unit_code']} - {$unit['unit_name']}");
                    } else {
                        $skipped++;
                        $this->command->line("Skipped (already exists): {$unit['unit_code']}");
                    }
                } catch (\Exception $e) {
                    $this->command->error("Error creating {$unit['unit_code']}: " . $e->getMessage());
                    Log::error('Seeder error: ' . $e->getMessage(), ['unit' => $unit]);
                }
            }

            $this->command->newLine();
            $this->command->info("Summary:");
            $this->command->info("   Created: {$created}");
            $this->command->info("   Skipped: {$skipped}");
            $this->command->info("   Total in database: " . Unit::count());
            $this->command->info('Seeding units selesai!');
        } catch (\Exception $e) {
            $this->command->error('Seeder error: ' . $e->getMessage());
            Log::error('UnitSeeder failed: ' . $e->getMessage());
        }
    }

    private function param(string $groupCode, string $valueCode): ParameterValue
    {
        return ParameterValue::where('code', $valueCode)
            ->whereHas(
                'parameter',
                fn($q) =>
                $q->where('group_code', $groupCode)
            )
            ->firstOrFail();
    }
}
