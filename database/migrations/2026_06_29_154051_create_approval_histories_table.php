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
        // Schema::create('approval_histories', function (Blueprint $table) {
        //     $table->id();

        //     $table->morphs('approvable');
        //     $table->integer('sequence')->default(1);

        //     $table->enum('action', [
        //         'submit',
        //         'verify',
        //         'approve',
        //         'reject',
        //         'return',
        //         'revise',
        //     ]);

        //     $table->foreignId('user_id')->constrained('users');
        //     $table->string('user_name')->nullable();
        //     $table->string('user_role')->nullable();

        //     $table->string('from_status')->nullable();
        //     $table->string('to_status')->nullable();

        //     $table->text('notes')->nullable();

        //     $table->timestamp('action_at')->useCurrent();
        //     $table->index(
        //         ['approvable_type', 'approvable_id', 'action_at'],
        //         'idx_approval_histories_timeline'
        //     );
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_histories');
    }
};
