<?php

namespace Modules\Disbursement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Budget\Models\BudgetRequestItem;

class BudgetDisbursementItem extends Model
{
    use HasFactory;

    protected $table = 'budget_disbursement_items';

    protected $fillable = [
        'budget_disbursement_header_id',
        'budget_request_item_id',
        'total_amount',
        'notes',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'released_amount',
        'remaining_amount'
    ];

    // Relations
    public function header()
    {
        return $this->belongsTo(
            BudgetDisbursementHeader::class,
            'budget_disbursement_header_id'
        );
    }

    public function requestItem()
    {
        return $this->belongsTo(
            BudgetRequestItem::class,
            'budget_request_item_id'
        );
    }

    public function recipients() {
         return $this->hasMany(BudgetDisbursementRecipient::class, 'budget_disbursement_item_id');
    }

    public function fundReleaseItems(): HasMany
    {
        return $this->hasMany(BudgetFundReleaseItem::class, 'budget_disbursement_item_id');
    }

    /**
     * Hitung total released amount menggunakan hasil dari eager load withSum di controller
     */
    public function getReleasedAmountAttribute(): float
    {
        return (float) ($this->attributes['fund_release_items_sum_total_amount'] ?? 0);
    }

    /**
     * Hitung remaining amount (total_amount - released_amount)
     */
    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->total_amount - $this->released_amount;
    }
}