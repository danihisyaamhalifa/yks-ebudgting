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
        Schema::dropIfExists('budget_disbursement_approvals');
        Schema::create('budget_disbursement_approvals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_disbursement_header_id');
            $table->foreign('budget_disbursement_header_id', 'fk_bd_approvals_header')
                ->references('id')
                ->on('budget_disbursement_headers')
                ->cascadeOnDelete();

            $table->integer('approval_level');

            $table->foreignId('role_id');
            $table->foreign('role_id', 'fk_bd_approvals_role')
                ->references('id')
                ->on('roles')
                ->restrictOnDelete();

            $table->enum('status', [
                'waiting',
                'pending',
                'approved',
                'rejected',
                'returned'
            ])->default('waiting');

            $table->boolean('is_current')->default(false);

            $table->foreignId('approved_by')->nullable();
            $table->foreign('approved_by', 'bd_approvals_user_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexing untuk optimasi query pencairan dana
            $table->index(
                ['budget_disbursement_header_id', 'approval_level'],
                'idx_bd_approvals_level'
            );

            $table->index(
                ['budget_disbursement_header_id', 'status'],
                'idx_bd_approvals_status'
            );

            $table->index(
                ['budget_disbursement_header_id', 'is_current'],
                'idx_bd_approvals_current'
            );

            // Constraint unik untuk level approval per role
            $table->unique(
                ['budget_disbursement_header_id', 'approval_level', 'role_id'],
                'uniq_bd_approvals_level_role'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_disbursement_approvals');
    }
};
