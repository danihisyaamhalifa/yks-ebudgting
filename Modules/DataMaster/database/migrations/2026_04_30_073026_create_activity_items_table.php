<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_items', function (Blueprint $table) {
            $table->id();

            $table->string('item_code', 30)->unique();
            $table->string('item_name', 150);

            $table->foreignId('trans_type_id')->constrained('parameter_values');
            $table->foreignId('unit_measure_id')->constrained('parameter_values');

            $table->decimal('estimation_price', 15, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_items');
    }
};
