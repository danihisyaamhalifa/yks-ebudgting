<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalWorkflowStep extends Model
{
    protected $table = 'approval_workflow_step';

    protected $fillable = [
        'approval_workflow_id',
        'approval_level',
        'role_id',
    ];

    /**
     * The module workflow this step belongs to.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class, 'approval_workflow_id');
    }

    /**
     * The role assigned to this step.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
