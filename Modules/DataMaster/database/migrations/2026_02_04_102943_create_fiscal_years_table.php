<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fiscal_years', function (Blueprint $table) {
            $table->id();

            $table->string('year', 4)->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['open', 'locked', 'closed'])->default('open');
            $table->boolean('is_active')->default(false);
            $table->string('description')->nullable();
            $table->timestamps();

            // indexes
            $table->index('status', 'idx_status');
            $table->index(['start_date', 'end_date'], 'idx_period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fiscal_years');
    }
};
