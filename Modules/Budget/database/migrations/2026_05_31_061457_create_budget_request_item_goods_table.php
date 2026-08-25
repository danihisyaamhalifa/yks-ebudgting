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
        Schema::create('budget_request_item_goods', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_request_item_id')
                ->constrained('budget_request_items')
                ->cascadeOnDelete();

            $table->string('item_name');
            $table->enum('goods_type', ['bhp', 'non_bhp'])->default('bhp');
            $table->string('specification')->nullable();
            $table->string('brand')->nullable();
            $table->integer('quantity')->default(1);
            $table->string('unit_measure', 30)->nullable();
            $table->decimal('unit_price', 18, 2);
            $table->decimal('subtotal', 18, 2);
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_request_item_goods');
    }
};
