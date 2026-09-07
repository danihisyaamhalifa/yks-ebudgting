<?php

namespace Modules\Budget\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetRequestItemMultiplier extends Model
{
    protected $fillable = [
        'budget_request_item_id',
        'sequence',
        'label',
        'value',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'sequence' => 'integer',
        'value' => 'decimal:2',
    ];

    public function budgetRequestItem(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestItem::class);
    }
}
