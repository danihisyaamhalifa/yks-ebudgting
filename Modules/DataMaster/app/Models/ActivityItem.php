<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityItem extends Model
{
    use HasFactory;

    protected $table = 'activity_items';

    protected $fillable = [
        'item_code',
        'item_name',
        'trans_type_id',
        'unit_measure_id',
        'estimation_price',
        'is_active',
    ];

    protected $casts = [
        'estimation_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function transType()
    {
        return $this->belongsTo(ParameterValue::class, 'trans_type_id');
    }

    public function unitMeasure()
    {
        return $this->belongsTo(ParameterValue::class, 'unit_measure_id');
    }

    /**
     * Scope
     */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
             
            if ($model->item_code) {
                return;
            }

            $lastCode = self::where('item_code', 'like', 'IT-%')
                ->select('item_code')
                ->orderByRaw("
            CAST(SUBSTRING(item_code, 4) AS UNSIGNED) DESC
        ")
                ->value('item_code');

            $lastNumber = $lastCode
                ? (int) substr($lastCode, 3)
                : 0;

            $newNumber = $lastNumber + 1;

            $model->item_code = 'IT-' . str_pad($newNumber, 2, '0', STR_PAD_LEFT);
        });
    }

    protected static function booted()
{
    static::updated(function ($activityItem) {
        if ($activityItem->isDirty('unit_measure_id')) {
            \Modules\Budget\Models\BudgetRequestItem::where('activity_item_id', $activityItem->id)
                ->update(['unit_measure_id' => $activityItem->unit_measure_id]);
        }
    });
}
}
