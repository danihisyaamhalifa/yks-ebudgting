<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('budget_request_activities', 'parent_id')) {
            Schema::table('budget_request_activities', function (Blueprint $table) {
                $table->foreignId('parent_id')
                    ->nullable()
                    ->after('budget_request_header_id')
                    ->constrained('budget_request_activities')
                    ->onDelete('cascade');

                $table->index('parent_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('budget_request_activities', 'parent_id')) {
            Schema::table('budget_request_activities', function (Blueprint $table) {
                $table->dropForeign(['parent_id']);
                $table->dropIndex(['parent_id']);
                $table->dropColumn('parent_id');
            });
        }
    }
};
