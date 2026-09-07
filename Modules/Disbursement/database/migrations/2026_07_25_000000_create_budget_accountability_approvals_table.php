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
        Schema::create('budget_accountability_approvals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_accountability_id');
            $table->foreign('budget_accountability_id', 'fk_ba_approvals_accountability')
                ->references('id')
                ->on('budget_accountabilities')
                ->cascadeOnDelete();

            $table->integer('approval_level');

            $table->foreignId('role_id');
            $table->foreign('role_id', 'fk_ba_approvals_role')
                ->references('id')
                ->on('roles')
                ->restrictOnDelete();

            $table->enum('status', [
                'waiting',
                'pending',
                'approved',
                'rejected',
                'returned',
            ])->default('waiting');

            $table->boolean('is_current')->default(false);

            $table->foreignId('approved_by')->nullable();
            $table->foreign('approved_by', 'ba_approvals_user_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexing untuk optimasi query verifikasi pertanggungjawaban
            $table->index(
                ['budget_accountability_id', 'approval_level'],
                'idx_ba_approvals_level'
            );

            $table->index(
                ['budget_accountability_id', 'status'],
                'idx_ba_approvals_status'
            );

            $table->index(
                ['budget_accountability_id', 'is_current'],
                'idx_ba_approvals_current'
            );

            // Constraint unik untuk level approval per role
            $table->unique(
                ['budget_accountability_id', 'approval_level', 'role_id'],
                'uniq_ba_approvals_level_role'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_accountability_approvals');
    }
};
