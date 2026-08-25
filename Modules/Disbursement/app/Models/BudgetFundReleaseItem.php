<?php

namespace Modules\Disbursement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetFundReleaseItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_fund_release_items';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_fund_release_id',
        'budget_disbursement_item_id',
        'total_amount',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the fund release that owns the item.
     */
    public function fundRelease(): BelongsTo
    {
        return $this->belongsTo(BudgetFundRelease::class, 'budget_fund_release_id');
    }

    /**
     * Get the disbursement item that owns the item.
     */
    public function disbursementItem(): BelongsTo
    {
        return $this->belongsTo(BudgetDisbursementItem::class, 'budget_disbursement_item_id');
    }
}
