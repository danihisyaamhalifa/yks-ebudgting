<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        try {
            if (!Schema::hasTable('budget_request_items')) {
                Schema::create('budget_request_items', function (Blueprint $table) {
                    $table->id();

                    $table->foreignId('budget_request_activity_id')
                        ->constrained('budget_request_activities')
                        ->onDelete('cascade');

                    $table->foreignId('activity_item_id')->constrained('activity_items');
                    $table->string('description', 150);

                    $table->foreignId('unit_measure_id')->nullable()
                        ->constrained('parameter_values');

                    $table->decimal('volume', 8, 2)->default(1);
                    $table->decimal('unit_price', 15, 2)->default(0);
                    $table->decimal('total_amount', 15, 2)->default(0);

                    $table->text('notes')->nullable();
                    $table->timestamps();

                    // --- INDEXING ---
                    $table->index('budget_request_activity_id', 'idx_item_activity');
                });
            }
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_request_items');
    }
};
