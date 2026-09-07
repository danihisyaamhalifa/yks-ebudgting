<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Transform the approval_workflows table from the old flat schema
 * (module_name, approval_level, role_id) into the two-table design:
 *
 *   - approval_workflows        : module_name + unit_type  (unique together)
 *   - approval_workflow_steps   : approval_workflow_id + approval_level + role_id
 *
 * Existing rows (which have no unit_type yet) are preserved and assigned to the
 * 'prodi' unit_type as a default, so no data is lost. Idempotent: safe to re-run.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Already in the new design (approval_level column no longer exists) -> nothing to do
        if (!Schema::hasColumn('approval_workflows', 'approval_level')) {
            return;
        }

        // Ensure the steps table exists (in case this runs without the 2026_07_20 migration)
        if (!Schema::hasTable('approval_workflow_steps')) {
            Schema::create('approval_workflow_steps', function (Blueprint $table) {
                $table->id();
                $table->foreignId('approval_workflow_id')
                    ->constrained('approval_workflows')
                    ->cascadeOnDelete();
                $table->integer('approval_level');
                $table->foreignId('role_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['approval_workflow_id', 'approval_level'], 'workflow_level_unique');
            });
        }

        // Add unit_type column (nullable during backfill) if not present
        if (!Schema::hasColumn('approval_workflows', 'unit_type')) {
            Schema::table('approval_workflows', function (Blueprint $table) {
                $table->string('unit_type', 50)->nullable()->after('module_name');
            });
        }

        // Old flat columns are NOT NULL; make them nullable so we can insert new
        // two-table rows before dropping them.
        Schema::table('approval_workflows', function (Blueprint $table) {
            $table->integer('approval_level')->nullable()->change();
            $table->unsignedBigInteger('role_id')->nullable()->change();
        });

        // Backfill only rows that are still flat (i.e. have an approval_level value)
        $flatRows = DB::table('approval_workflows')
            ->whereNotNull('approval_level')
            ->get();

        $grouped = $flatRows->groupBy('module_name');

        foreach ($grouped as $moduleName => $rows) {
            $workflowId = DB::table('approval_workflows')->insertGetId([
                'module_name' => $moduleName,
                'unit_type' => 'prodi', // default for legacy data
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($rows as $row) {
                DB::table('approval_workflow_steps')->insert([
                    'approval_workflow_id' => $workflowId,
                    'approval_level' => $row->approval_level,
                    'role_id' => $row->role_id,
                    'created_at' => $row->created_at ?? now(),
                    'updated_at' => $row->updated_at ?? now(),
                ]);
            }
        }

        // Remove the old flat rows
        if ($flatRows->isNotEmpty()) {
            DB::table('approval_workflows')->whereIn('id', $flatRows->pluck('id'))->delete();
        }

        // Drop legacy FK + unique index on the old flat columns so the columns can be removed
        Schema::table('approval_workflows', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropUnique('approval_unique');
            $table->dropColumn(['approval_level', 'role_id']);
            $table->string('unit_type', 50)->nullable(false)->change();
            $table->unique(['module_name', 'unit_type'], 'approval_module_unit_unique');
        });
    }

    public function down(): void
    {
        // Note: reversing is not supported because it would require reconstructing
        // the old flat rows from steps. Re-run from a fresh migration instead.
    }
};
