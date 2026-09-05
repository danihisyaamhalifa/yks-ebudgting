<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
    protected $table = 'approval_workflow';

    protected $fillable = [
        'approval_workflow_header_id',
        'module_name',
    ];

    /**
     * The header this module workflow belongs to.
     */
    public function header(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflowHeader::class, 'approval_workflow_header_id');
    }

    /**
     * Approval steps for this module workflow.
     */
    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalWorkflowStep::class, 'approval_workflow_id');
    }
}
