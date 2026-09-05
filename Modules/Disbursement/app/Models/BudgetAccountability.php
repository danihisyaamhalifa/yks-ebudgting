<?php

namespace Modules\Disbursement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetAccountability extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_accountabilities';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'accountability_no',
        'accountability_date',
        'budget_fund_release_id',
        'budget_fund_release_item_id',
        'total_received',
        'total_spent',
        'total_returned',
        'status',
        'notes',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'accountability_date' => 'date',
        'total_received' => 'decimal:2',
        'total_spent' => 'decimal:2',
        'total_returned' => 'decimal:2',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'draft',
        'total_received' => 0,
        'total_spent' => 0,
        'total_returned' => 0,
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * Get the fund release that owns the accountability.
     */
    public function fundRelease(): BelongsTo
    {
        return $this->belongsTo(BudgetFundRelease::class, 'budget_fund_release_id');
    }

    /**
     * Get the fund release item that owns the accountability.
     */
    public function fundReleaseItem(): BelongsTo
    {
        return $this->belongsTo(BudgetFundReleaseItem::class, 'budget_fund_release_item_id');
    }

    /**
     * Get the user who created the record.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the record.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the items for the accountability.
     */
    public function items(): HasMany
    {
        return $this->hasMany(BudgetAccountabilityItem::class);
    }

    /**
     * Get the returns for the accountability.
     */
    public function returns(): HasMany
    {
        return $this->hasMany(BudgetAccountabilityReturn::class);
    }

    /**
     * Get the documents for the accountability.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(BudgetAccountabilityDocument::class, 'budget_accountability_id');
    }

    /**
     * Get the approval steps for the accountability.
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(BudgetAccountabilityApproval::class, 'budget_accountability_id');
    }

    /**
     * Get the remaining amount that hasn't been accounted for.
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->total_received - ($this->total_spent + $this->total_returned);
    }

    /**
     * Check if accountability is fully settled.
     */
    public function isFullySettled(): bool
    {
        return $this->remaining_amount <= 0;
    }

    /**
     * Scope: only draft records.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope: only submitted records.
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope: only approved records.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->accountability_no)) {
                $model->accountability_no = static::generateAccountabilityNo();
            }
        });
    }

    /**
     * Generate a unique accountability number.
     */
    protected static function generateAccountabilityNo(): string
    {
        $prefix = 'SPJ-' . date('Ymd');
        $lastRecord = static::where('accountability_no', 'like', $prefix . '%')
            ->orderBy('accountability_no', 'desc')
            ->first();

        if ($lastRecord) {
            $lastNumber = (int) substr($lastRecord->accountability_no, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . '-' . $newNumber;
    }
}