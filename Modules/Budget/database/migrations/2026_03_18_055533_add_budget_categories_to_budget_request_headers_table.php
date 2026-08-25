<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('budget_request_headers', function (Blueprint $table) {
            // Menambahkan kolom budget_category_id
            $table->foreignId('budget_category_id')
                ->nullable()
                ->after('unit_id')
                ->constrained('budget_categories')
                ->onDelete('restrict');

            // Menambahkan kolom sub_budget_category_id (self-reference ke budget_categories)
            $table->foreignId('sub_budget_category_id')
                ->nullable()
                ->after('budget_category_id')
                ->constrained('budget_categories')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budget_request_headers', function (Blueprint $table) {
            // Hapus foreign key constraints terlebih dahulu
            $table->dropForeign(['budget_category_id']);
            $table->dropForeign(['sub_budget_category_id']);
            
            // Hapus kolom
            $table->dropColumn(['budget_category_id', 'sub_budget_category_id']);
        });
    }
};
