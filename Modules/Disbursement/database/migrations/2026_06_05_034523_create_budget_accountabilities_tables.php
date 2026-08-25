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
        Schema::create('budget_accountabilities', function (Blueprint $table) {
            $table->id();

            $table->string('accountability_no', 30)->unique();
            $table->date('accountability_date');

            $table->foreignId('budget_fund_release_id')
                ->constrained('budget_fund_releases')
                ->cascadeOnDelete();

            $table->foreignId('budget_fund_release_item_id')
                ->nullable()
                ->constrained('budget_fund_release_items')
                ->cascadeOnDelete();

            $table->decimal('total_received', 18, 2)->default(0);
            $table->decimal('total_spent', 18, 2)->default(0);
            $table->decimal('total_returned', 18, 2)->default(0);

            $table->enum('status', [
                'draft',
                'submitted',
                'verified',
                'approved',
                'returned',
            ])->default('draft');

            $table->text('notes')->nullable();

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_accountabilities');
    }
};
