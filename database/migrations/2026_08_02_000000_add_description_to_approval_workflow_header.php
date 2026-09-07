<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add description to approval_workflow_header (used for the reusable header).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('approval_workflow_header', 'description')) {
            Schema::table('approval_workflow_header', function (Blueprint $table) {
                $table->text('description')->nullable()->after('name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('approval_workflow_header', 'description')) {
            Schema::table('approval_workflow_header', function (Blueprint $table) {
                $table->dropColumn('description');
            });
        }
    }
};
