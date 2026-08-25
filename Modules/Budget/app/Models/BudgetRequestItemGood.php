<?php

namespace Modules\Budget\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetRequestItemGood extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_request_item_goods';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_request_item_id',
        'item_name',
        'goods_type',
        'specification',
        'brand',
        'quantity',
        'unit_measure',
        'unit_price',
        'subtotal',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'goods_type' => 'string',
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'goods_type' => 'bhp',
        'quantity' => 1,
    ];

    /**
     * Get the budget request item that owns this good.
     */
    public function budgetRequestItem(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestItem::class);
    }

    /**
     * Scope a query to only include BHP goods.
     */
    public function scopeBhp($query)
    {
        return $query->where('goods_type', 'bhp');
    }

    /**
     * Scope a query to only include non-BHP goods.
     */
    public function scopeNonBhp($query)
    {
        return $query->where('goods_type', 'non_bhp');
    }

    /**
     * Calculate subtotal based on quantity and unit price.
     */
    public function calculateSubtotal(): void
    {
        $this->subtotal = $this->quantity * $this->unit_price;
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (BudgetRequestItemGood $good) {
            if (empty($good->subtotal)) {
                $good->calculateSubtotal();
            }
        });

        static::updating(function (BudgetRequestItemGood $good) {
            if ($good->isDirty(['quantity', 'unit_price'])) {
                $good->calculateSubtotal();
            }
        });
    }
}
