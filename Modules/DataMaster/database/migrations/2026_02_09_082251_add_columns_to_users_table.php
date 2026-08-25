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
        Schema::table('users', function (Blueprint $table) {
            // Menambahkan username, position, dan unit_id
            $table->string('username')->unique()->after('name');
            $table->string('position')->nullable()->after('password');

            // Menambahkan foreign key ke tabel units
            $table->foreignId('unit_id')->nullable()->after('position')->constrained('units')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Menghapus kembali jika migration di-rollback
            $table->dropForeign(['unit_id']);
            $table->dropColumn(['username', 'position', 'unit_id']);
        });
    }
};
