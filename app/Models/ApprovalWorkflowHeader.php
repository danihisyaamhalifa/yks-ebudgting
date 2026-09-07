<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\DataMaster\Models\Unit;

class ApprovalWorkflowHeader extends Model
{
    protected $table = 'approval_workflow_header';

    protected $fillable = [
        'name',
        'description',
        'unit_type',
    ];

    /**
     * Units that use this header (a header can be reused by many units).
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class, 'approval_workflow_id');
    }

    /**
     * Module workflows under this header.
     */
    public function workflows(): HasMany
    {
        return $this->hasMany(ApprovalWorkflow::class, 'approval_workflow_header_id');
    }
}
