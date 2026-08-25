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
        Schema::create('budget_disbursement_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_disbursement_header_id')
                ->constrained('budget_disbursement_headers')
                ->cascadeOnDelete();

            $table->foreignId('budget_request_item_id')
                ->constrained('budget_request_items');

            $table->decimal('total_amount', 18, 2)->default(0);

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index('budget_disbursement_header_id', 'idx_disbursement_header');
            $table->index('budget_request_item_id', 'idx_disbursement_request_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_disbursement_items');
    }
};