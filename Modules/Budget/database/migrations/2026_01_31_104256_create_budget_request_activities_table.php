<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        try {
            if (!Schema::hasTable('budget_request_activities')) {
                Schema::create('budget_request_activities', function (Blueprint $table) {
                    $table->id();

                    $table->foreignId('budget_request_header_id')
                        ->constrained('budget_request_headers')
                        ->onDelete('cascade');

                    $table->foreignId('activity_id')
                        ->constrained('activities');

                    $table->string('description')->nullable();
                    $table->date('start_date')->nullable();
                    $table->date('end_date')->nullable();

                    $table->decimal('total_amount', 15, 2)->default(0);

                    $table->timestamps();

                    $table->unique(['budget_request_header_id', 'activity_id', 'start_date', 'end_date'], 'uq_budget_activity');
                    $table->index('activity_id', 'idx_activity_search');
                    $table->index(['start_date', 'end_date'], 'idx_activity_period');
                });
            }
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_request_activities');
    }
};
