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
        Schema::create('budget_request_item_employees', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_request_item_id')
                ->constrained('budget_request_items')
                ->cascadeOnDelete();

            $table->string('nik', 30);
            $table->string('employee_name', 150);
            $table->string('functional_position', 100)->nullable();
            $table->decimal('teaching_hours', 8, 2);
            $table->integer('class_count')->default(1);
            $table->decimal('rate', 18, 2);
            $table->decimal('total', 18, 2);
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_request_item_employees');
    }
};
