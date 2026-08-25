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
        Schema::create('budget_accountability_returns', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_accountability_id')
                ->constrained('budget_accountabilities')
                ->cascadeOnDelete();

            $table->date('return_date');
            $table->decimal('amount', 18, 2);
            $table->string('receipt_no', 50)->nullable();

            $table->foreignId('fund_source_id')
                ->constrained('fund_sources');

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_accountability_returns');
    }
};
