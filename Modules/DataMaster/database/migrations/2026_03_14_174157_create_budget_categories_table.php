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
        Schema::create('budget_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('budget_categories')->cascadeOnDelete();
            $table->string('code', 20)->unique();
            $table->string('name', 200);
            $table->enum('budget_type', ['budgeter', 'non_budgeter']); 
            $table->enum('sub_budget_type', ['rutin', 'non_rutin', 'kondisional'])->nullable();
            $table->json('unit_ids')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_categories');
    }
};
