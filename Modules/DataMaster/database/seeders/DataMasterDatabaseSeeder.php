<?php

namespace Modules\DataMaster\Database\Seeders;

use Illuminate\Database\Seeder;

class DataMasterDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        $this->call([
            // ParameterSeeder::class,
            // UnitSeeder::class,
            // CoaSeeder::class,
            // AcademicPeriodSeeder::class,
            ActivitySeeder::class,
            // BudgetCategorySeeder::class
        ]);
    }
}
