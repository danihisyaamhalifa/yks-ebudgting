<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Rework approval workflow to the per-Unit header schema:
 *
 *   approval_workflow_header (id, name, unit_type)              -- 1:1 per Unit (units.approval_workflow_id)
 *   approval_workflow        (id, approval_workflow_header_id, module_name)
 *   approval_workflow_step   (id, approval_workflow_id, approval_level, role_id)
 *
 * Legacy rows (previously keyed by unit_type) are migrated into a default
 * approval_workflow_header assigned to the first active 'prodi' Unit.
 */
return new class extends Migration
{
    public function up(): void
    {
        // If the new schema already exists, nothing to do.
        if (Schema::hasTable('approval_workflow_header')) {
            return;
        }

        // Snapshot legacy data before dropping.
        $legacyWorkflows = Schema::hasTable('approval_workflows')
            ? DB::table('approval_workflows')->get()->keyBy('id')
            : collect();

        $legacySteps = Schema::hasTable('approval_workflow_steps')
            ? DB::table('approval_workflow_steps')->get()
            : collect();

        // Drop old tables (steps first because of FK).
        if (Schema::hasTable('approval_workflow_steps')) {
            Schema::dropIfExists('approval_workflow_steps');
        }
        if (Schema::hasTable('approval_workflows')) {
            Schema::dropIfExists('approval_workflows');
        }

        // --- Create new tables ------------------------------------------------
        Schema::create('approval_workflow_header', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            // unit_type is only a helper for filtering in the Unit UI.
            $table->string('unit_type', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('approval_workflow', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_workflow_header_id')
                ->constrained('approval_workflow_header')
                ->cascadeOnDelete();
            $table->string('module_name', 50);
            $table->timestamps();
            $table->unique(['approval_workflow_header_id', 'module_name'], 'awf_header_module_unique');
        });

        Schema::create('approval_workflow_step', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_workflow_id')
                ->constrained('approval_workflow')
                ->cascadeOnDelete();
            $table->integer('approval_level');
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['approval_workflow_id', 'approval_level'], 'awf_step_level_unique');
        });

        // --- Link Units to a header -------------------------------------------
        Schema::table('units', function (Blueprint $table) {
            if (!Schema::hasColumn('units', 'approval_workflow_id')) {
                $table->foreignId('approval_workflow_id')
                    ->nullable()
                    ->after('is_active')
                    ->constrained('approval_workflow_header')
                    ->nullOnDelete();
            }
        });

        // --- Migrate legacy data into one default prodi header -----------------
        $defaultUnit = DB::table('units')
            ->where('unit_type', 'prodi')
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if ($defaultUnit) {
            $headerId = DB::table('approval_workflow_header')->insertGetId([
                'name' => $defaultUnit->unit_name ?? ('Workflow ' . $defaultUnit->unit_code),
                'unit_type' => 'prodi',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('units')->where('id', $defaultUnit->id)->update([
                'approval_workflow_id' => $headerId,
            ]);

            // Create module rows + steps from legacy data.
            foreach ($legacyWorkflows as $legacy) {
                $module = $legacy->module_name;
                $moduleId = DB::table('approval_workflow')->insertGetId([
                    'approval_workflow_header_id' => $headerId,
                    'module_name' => $module,
                    'created_at' => $legacy->created_at ?? now(),
                    'updated_at' => $legacy->updated_at ?? now(),
                ]);

                foreach ($legacySteps->where('approval_workflow_id', $legacy->id) as $step) {
                    DB::table('approval_workflow_step')->insert([
                        'approval_workflow_id' => $moduleId,
                        'approval_level' => $step->approval_level,
                        'role_id' => $step->role_id,
                        'created_at' => $step->created_at ?? now(),
                        'updated_at' => $step->updated_at ?? now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Reconstructing the old flat schema is not supported.
    }
};
