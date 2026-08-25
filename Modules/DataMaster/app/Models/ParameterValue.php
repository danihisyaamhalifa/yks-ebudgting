<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ParameterValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'parameter_id',
        'code',
        'name',
        'description',
        'group_code',
        'sort_order',
        'is_active',
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

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get data parameter (header)
     */
    public function parameter(): BelongsTo
    {
        return $this->belongsTo(Parameter::class);
    }

    /**
     * Scope hanya value aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope filter berdasarkan group_code
     */
    public function scopeByGroup($query, string $groupCode)
    {
        return $query->whereHas('parameter', fn ($q) =>
            $q->where('group_code', $groupCode)
        );
    }
}
