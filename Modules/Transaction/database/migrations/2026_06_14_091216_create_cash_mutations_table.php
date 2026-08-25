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
        // Schema::create('cash_mutations', function (Blueprint $table) {
        //     $table->id();
        //     $table->string('mutation_no', 30)->unique();
        //     $table->date('mutation_date');
        //     $table->foreignId('fund_source_id')->constrained('fund_sources');
        //     $table->enum('type', ['in', 'out']);
        //     $table->decimal('amount', 18, 2);
        //     $table->string('description');
        //     $table->nullableMorphs('source');
        //     $table->decimal('balance', 18, 2);
        //     $table->text('notes')->nullable();
        //     $table->foreignId('created_by')->constrained('users');
        //     $table->timestamps();

        //     $table->index('mutation_date', 'idx_cm_mutationdate');
        //     $table->index(['fund_source_id', 'mutation_date'], 'idx_cm_fundsource_mutationdate');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_mutations');
    }
};
