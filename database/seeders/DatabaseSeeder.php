<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // $this->call(RolePermissionSeeder::class);

        $superadmin = User::firstOrCreate([
            'username' => 'admin',
            'email' => 'danset@example.com',
        ], [
            'name' => 'Super Admin',
            'password' => bcrypt('akuadmin'),
        ]);

        if (!$superadmin->hasRole('superadmin')) {
            $superadmin->assignRole('superadmin');
        }
    }
}
