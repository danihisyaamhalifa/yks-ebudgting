<?php

namespace Modules\Disbursement\Models;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetFundReleaseApproval extends Model
{
    protected $table = 'budget_fund_release_approvals';

    protected $fillable = [
        'budget_fund_release_id',
        'approval_level',
        'role_id',
        'status',
        'is_current',
        'approved_by',
        'approved_at',
        'notes',
    ];

    protected $casts = [
        'approval_level' => 'integer',
        'is_current' => 'boolean',
        'approved_at' => 'datetime',
    ];

    /** 
     * Relations
     */
    public function fundRelease(): BelongsTo
    {
        return $this->belongsTo(BudgetFundRelease::class, 'budget_fund_release_id');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scopes
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /** 
     * Helpers
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isWaiting(): bool
    {
        return $this->status === 'waiting';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
