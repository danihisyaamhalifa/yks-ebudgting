<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $table = 'activities';

    protected $fillable = [
        'activity_code',
        'activity_name',
        'unit_ids',
        'is_active',
        'description',
    ];

    protected $casts = [
        'unit_ids' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope for active activities only.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {

            if ($model->activity_code) {
                return;
            }

            $lastCode = self::where('activity_code', 'like', 'KG-%')
                ->select('activity_code')
                ->orderByRaw("
            CAST(SUBSTRING(activity_code, 4) AS UNSIGNED) DESC
        ")
            ->value('activity_code');

            $lastNumber = $lastCode
                ? (int) substr($lastCode, 3)
                : 0;

            $newNumber = $lastNumber + 1;

            $model->activity_code = 'KG-' . str_pad($newNumber, 2, '0', STR_PAD_LEFT);
        });
    }
}
