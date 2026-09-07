<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the 'rejected' value to the budget_accountabilities.status enum.
     *
     * MySQL does not support removing/adding enum values via the Schema
     * builder without doctrine/dbal, so we use a raw ALTER statement.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE budget_accountabilities MODIFY COLUMN status ENUM('draft', 'submitted', 'verified', 'approved', 'returned', 'rejected') NOT NULL DEFAULT 'draft'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE budget_accountabilities MODIFY COLUMN status ENUM('draft', 'submitted', 'verified', 'approved', 'returned') NOT NULL DEFAULT 'draft'");
        }
    }
};
