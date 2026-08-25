<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fund_sources', function (Blueprint $table) {
            $table->id();

            $table->string('code', 20)->unique();
            $table->string('name', 100);

            $table->enum('fund_source_type', ['cash', 'bank', 'other']);

            $table->foreignId('cash_bank_id')
                ->nullable()
                ->constrained('cash_banks')
                ->nullOnDelete();
            
            $table->enum('fund_source_owner', ['yayasan', 'institut'])
            ->default('institut');

            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_sources');
    }
};