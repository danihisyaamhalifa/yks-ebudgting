<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('budget_request_item_multipliers')) {
            Schema::create('budget_request_item_multipliers', function (Blueprint $table) {
                $table->id();

                $table->foreignId('budget_request_item_id')
                    ->constrained('budget_request_items')
                    ->onDelete('cascade');

                $table->unsignedSmallInteger('sequence')->default(1);
                $table->string('label', 60)->default('Volume');
                $table->decimal('value', 15, 2)->default(1);

                $table->timestamps();

                $table->index('budget_request_item_id', 'idx_multiplier_item');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_request_item_multipliers');
    }
};
