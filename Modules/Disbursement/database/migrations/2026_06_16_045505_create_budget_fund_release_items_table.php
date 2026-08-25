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
        // Schema::create('budget_fund_release_items', function (Blueprint $table) {
        //     $table->id();

        //     $table->foreignId('budget_fund_release_id')
        //         ->constrained('budget_fund_releases')
        //         ->cascadeOnDelete();

        //     $table->foreignId('budget_disbursement_item_id')
        //         ->constrained('budget_disbursement_items');

        //     $table->decimal('total_amount', 18, 2)->default(0);

        //     $table->text('notes')->nullable();

        //     $table->timestamps();

        //     $table->index('budget_fund_release_id', 'idx_bfri_fund_release');
        //     $table->index('budget_disbursement_item_id', 'idx_bfri_disbursement_item');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_fund_release_items');
    }
};
