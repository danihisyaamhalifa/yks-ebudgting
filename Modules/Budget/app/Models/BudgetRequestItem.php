<?php

namespace Modules\Budget\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Budget\Models\BudgetRequestActivity;
use Modules\Budget\Models\BudgetRequestItemEmployee;
use Modules\DataMaster\Models\ActivityItem;
use Modules\DataMaster\Models\ParameterValue;
use Modules\Disbursement\Models\BudgetDisbursementItem;

class BudgetRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_request_activity_id',
        'activity_item_id',
        'description',
        'unit_measure_id',
        'volume',
        'unit_price',
        'total_amount',
        'calculation_mode',
        'notes',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'volume' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'calculation_mode' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relation
    public function requestActivity(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestActivity::class, 'budget_request_activity_id');
    }

    public function activityItem(): BelongsTo
    {
        return $this->belongsTo(ActivityItem::class);
    }

    public function goods(): HasMany
    {
        return $this->hasMany(BudgetRequestItemGood::class, 'budget_request_item_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(BudgetRequestItemEmployee::class, 'budget_request_item_id');
    }

    public function multipliers(): HasMany
    {
        return $this->hasMany(BudgetRequestItemMultiplier::class, 'budget_request_item_id');
    }

    public function unitMeasure(): BelongsTo
    {
        return $this->belongsTo(ParameterValue::class, 'unit_measure_id');
    }

    public function disbursementItems(): HasMany
    {
        return $this->hasMany(BudgetDisbursementItem::class, 'budget_request_item_id');
    }

    protected $appends = [
        'disbursed_amount',
        'remaining_amount'
    ];

    /**
     * Hitung total disbursed amount menggunakan hasil dari eager load withSum di controller
     */
    public function getDisbursedAmountAttribute(): float
    {
        return (float) ($this->attributes['disbursement_items_sum_total_amount'] ?? 0);
    }

    /**
     * Hitung remaining amount (total_amount - disbursed_amount)
     */
    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->total_amount - $this->disbursed_amount;
    }

    /**
     * Perkalian seluruh nilai pengali (multiplikasi volume).
     */
    public function getMultiplierProductAttribute(): float
    {
        if ($this->multipliers->isEmpty()) {
            return (float) $this->volume;
        }

        return (float) $this->multipliers->reduce(
            fn($carry, $multiplier) => $carry * (float) $multiplier->value,
            1,
        );
    }
}
