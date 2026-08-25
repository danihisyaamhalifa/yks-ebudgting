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
        Schema::create('coas', function (Blueprint $table) {
            $table->id();
            $table->string('account_code', 20)->unique();
            $table->string('account_name', 100);

            $table->enum('account_type', ['AKTIVA', 'KEWAJIBAN', 'MODAL', 'PENDAPATAN', 'BEBAN']);
            
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('coas')
                ->onDelete('cascade')
                ->nullOnDelete();
            
            $table->tinyInteger('level');
            $table->enum('normal_balance', ['DEBIT', 'KREDIT']);
            
            $table->boolean('is_header')->default(false);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coas');
    }
};