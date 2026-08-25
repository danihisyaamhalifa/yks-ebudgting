<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('budget_fund_releases');
        Schema::create('budget_fund_releases', function (Blueprint $table) {
            $table->id();

            $table->string('fund_release_no', 30)->unique();
            $table->date('fund_release_date');

            $table->foreignId('budget_disbursement_header_id')
                ->constrained('budget_disbursement_headers')
                ->cascadeOnDelete();

            $table->foreignId('fund_source_id')
                ->constrained('fund_sources');

            $table->enum('payment_type', ['cash', 'transfer'])->default('transfer');;

            $table->decimal('total_amount', 18, 2)->default(0);

            $table->string('recipient_bank_name', 100)->nullable();
            $table->string('recipient_account_no', 30)->nullable();
            $table->string('recipient_account_name', 100)->nullable();

            $table->string('recipient_name', 100)->nullable();
            $table->string('recipient_position', 100)->nullable();
            $table->string('recipient_department', 100)->nullable();

            $table->enum('status', [
                'draft',
                'submitted',
                'transfered',
            ])->default('draft');

            $table->text('notes')->nullable();

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_fund_releases');
    }
};
