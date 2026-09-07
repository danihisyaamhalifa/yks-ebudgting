<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('budget_request_items', 'calculation_mode')) {
            Schema::table('budget_request_items', function (Blueprint $table) {
                $table->string('calculation_mode', 20)->default('simple')->after('total_amount');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('budget_request_items', 'calculation_mode')) {
            Schema::table('budget_request_items', function (Blueprint $table) {
                $table->dropColumn('calculation_mode');
            });
        }
    }
};
