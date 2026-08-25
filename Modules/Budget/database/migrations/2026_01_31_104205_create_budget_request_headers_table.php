<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_request_headers', function (Blueprint $table) {
            $table->id();
            
            $table->string('request_no', 30)->unique();
            $table->date('request_date');

            $table->foreignId('fiscal_year_id')->constrained('fiscal_years')->onDelete('restrict');
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('restrict');
            $table->foreignId('unit_id')->constrained('units')->onDelete('restrict');

            $table->enum('budget_type', ['budgeter', 'non_budgeter']);

            $table->text('notes')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);

            $table->enum('status', [
                'draft',
                'submitted',
                'approved',
                'rejected',
                'returned'
            ])->default('draft')->index();

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index('request_date', 'idx_request_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_request_headers');
    }
};

