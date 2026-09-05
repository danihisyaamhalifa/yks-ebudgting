<?php

namespace Modules\Budget\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\DataMaster\Models\Activity;
use Modules\Disbursement\Models\BudgetDisbursementHeader;

class BudgetRequestActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_request_header_id',
        'parent_id',
        'activity_id',
        'description',
        'output_indicator',
        'start_date',
        'end_date',
        'total_amount',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    protected $appends = [
        'remaining_amount',
        'disbursed_amount'
    ];

    /**
     * Relationships
     */
    public function requestHeader(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestHeader::class, 'budget_request_header_id');
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function requestItems(): HasMany
    {
        return $this->hasMany(BudgetRequestItem::class, 'budget_request_activity_id');
    }

    public function documents()
    {
        return $this->hasMany(BudgetRequestActivityDocument::class, 'budget_request_activity_id');
    }

    public function disbursements(): HasMany
    {
        return $this->hasMany(BudgetDisbursementHeader::class, 'budget_request_activity_id');
    }

    /**
     * Parent activity (grouping container).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Child activities milik parent ini.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * Apakah aktivitas ini adalah parent/grouping (tidak punya item sendiri).
     */
    public function isParent(): bool
    {
        if ($this->relationLoaded('children')) {
            return $this->children->isNotEmpty();
        }

        return $this->children()->exists();
    }

    /**
     * Total dari seluruh child activities (untuk parent).
     */
    public function getChildrenTotalAttribute(): float
    {
        if ($this->relationLoaded('children')) {
            return (float) $this->children->sum('total_amount');
        }

        return 0.0;
    }

    /**
     * Hitung total disbursed amount menggunakan hasil dari eager load withSum di controller
     */
    public function getDisbursedAmountAttribute(): float
    {
        return (float) ($this->attributes['disbursements_sum_total_amount'] ?? 0);
    }

    /**
     * Hitung remaining amount (total_amount - disbursed_amount)
     */
    public function getRemainingAmountAttribute(): float
    {
        $remaining = (float) $this->total_amount - $this->disbursed_amount;
        return max($remaining, 0);
    }

    /**
     * Cek ketersediaan budget
     */
    public function hasAvailableBudget(float $amount): bool
    {
        return $this->remaining_amount >= $amount;
    }
}
