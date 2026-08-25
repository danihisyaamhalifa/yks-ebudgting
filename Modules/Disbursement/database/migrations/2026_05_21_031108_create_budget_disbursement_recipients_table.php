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
        Schema::create('budget_disbursement_recipients', function (Blueprint $table) {
            $table->id();

              $table->foreignId('budget_disbursement_item_id')
        ->constrained('budget_disbursement_items', 'id', 'bd_recipients_item_foreign')
        ->cascadeOnDelete();

            $table->nullableMorphs('recipient', 'bd_recipients_recipient_morph_idx');

            $table->string('recipient_name', 150);
            $table->string('identity_no', 50)->nullable();

            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_no', 30)->nullable();
            $table->string('bank_account_name', 100)->nullable();

            $table->decimal('amount', 18, 2);
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_disbursement_recipients');
    }
};
