<?php

namespace Modules\DataMaster\Models;

use App\Models\ApprovalWorkflowHeader;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'units';

    protected $fillable = [
        'unit_code',
        'unit_name',
        'unit_type',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'is_active',
        'approval_workflow_id',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    /**
     * Scope Active
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * The approval workflow header attached to this unit (1:1).
     */
    public function approvalWorkflowHeader(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflowHeader::class, 'approval_workflow_id');
    }

    /**
     * Module workflows accessible via this unit's header.
     */
    public function approvalWorkflows(): HasMany
    {
        return $this->hasMany(
            \App\Models\ApprovalWorkflow::class,
            'approval_workflow_header_id',
            'approval_workflow_id'
        );
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
             
            if ($model->unit_code) {
                return;
            }

            $lastCode = self::where('unit_code', 'like', 'UN-%')
                ->select('unit_code')
                ->orderByRaw("
            CAST(SUBSTRING(unit_code, 4) AS UNSIGNED) DESC
        ")
                ->value('unit_code');

            $lastNumber = $lastCode
                ? (int) substr($lastCode, 3)
                : 0;

            $newNumber = $lastNumber + 1;

            $model->unit_code = 'UN-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        });
    }
}
