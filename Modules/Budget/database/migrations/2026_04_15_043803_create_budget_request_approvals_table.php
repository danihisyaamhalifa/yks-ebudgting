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
        Schema::create('budget_request_approvals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('budget_request_header_id')
                ->constrained('budget_request_headers')
                ->cascadeOnDelete();

            $table->integer('approval_level');

            $table->foreignId('role_id')
                ->constrained('roles')
                ->restrictOnDelete();

            $table->enum('status', [
                'waiting',
                'pending',
                'approved',
                'rejected',
                'returned'
            ])->default('waiting');

            $table->boolean('is_current')->default(false);

            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('approved_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(
                ['budget_request_header_id', 'approval_level'],
                'idx_br_approvals_level'
            );

            $table->index(
                ['budget_request_header_id', 'status'],
                'idx_br_approvals_status'
            );

            $table->index(
                ['budget_request_header_id', 'is_current'],
                'idx_br_approvals_current'
            );

            $table->unique(
                ['budget_request_header_id', 'approval_level', 'role_id'],
                'uniq_br_approvals_level_role'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_request_approvals');
    }
};
