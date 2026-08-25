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
        Schema::table('activities', function (Blueprint $table) {
            // nullable() disarankan jika tabel sudah ada isinya agar tidak error saat alter
            $table->foreignId('budget_type_id')
                ->after('level') // meletakkan kolom setelah kolom level
                ->nullable() 
                ->constrained('parameter_values')
                ->onDelete('restrict'); 
        });
    }

     /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            // Hapus constraint dulu baru hapus kolom
            $table->dropForeign(['budget_type_id']);
            $table->dropColumn('budget_type_id');
        });
    }
};
