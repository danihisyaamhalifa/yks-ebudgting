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
        Schema::dropIfExists('budget_disbursement_headers');
        Schema::create('budget_disbursement_headers', function (Blueprint $table) {
            $table->id();
            
            $table->string('disbursement_no', 30)->unique();
            $table->date('disbursement_date');
            
            $table->foreignId('budget_request_header_id')
                ->constrained('budget_request_headers')
                ->restrictOnDelete();
                
            $table->foreignId('budget_request_activity_id')
                ->constrained('budget_request_activities')
                ->restrictOnDelete();

            $table->decimal('total_amount', 18, 2)->default(0);
            $table->text('notes')->nullable();
            
            $table->enum('status', [
                'draft', 'submitted', 'verified', 'approved', 'paid', 'returned', 'rejected'
            ])->default('draft')->index();

            
            // Audit trail
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            
            $table->timestamps();
            // $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_disbursement_headers');
    }
};