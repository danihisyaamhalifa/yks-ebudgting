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
