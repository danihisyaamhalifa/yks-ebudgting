<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parameter_values', function (Blueprint $table) {
            $table->id();

            $table->foreignId('parameter_id')
                ->constrained('parameters')
                ->cascadeOnDelete();

            $table->string('code', 50);
            $table->string('name', 100);

            $table->text('description')->nullable();
            $table->text('group_code')->nullable();
            $table->integer('sort_order')->default(0);

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['parameter_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parameter_values');
    }
};
