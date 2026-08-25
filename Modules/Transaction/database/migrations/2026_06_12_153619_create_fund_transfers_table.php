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
        // Schema::create('fund_transfers', function (Blueprint $table) {
        //     $table->id();

        //     $table->string('transfer_no', 30)->unique();
        //     $table->date('transfer_date');

        //     $table->foreignId('from_fund_source_id')->constrained('fund_sources');
        //     $table->foreignId('to_fund_source_id')->constrained('fund_sources');

        //     $table->enum('transfer_type', [
        //         'disbursement',
        //         'withdrawal',
        //         'deposit',
        //         'adjustment',
        //     ]);

        //     $table->decimal('amount', 18, 2);

        //     $table->nullableMorphs('source');

        //     $table->enum('status', ['draft', 'completed'])->default('draft');

        //     $table->dateTime('completed_at')->nullable();
        //     $table->string('reference_no', 50)->nullable();
        //     $table->text('notes')->nullable();

        //     $table->foreignId('created_by')->constrained('users');
        //     $table->foreignId('updated_by')->nullable()->constrained('users');

        //     $table->timestamps();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fund_transfers');
    }
};
