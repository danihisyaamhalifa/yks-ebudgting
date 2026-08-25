<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Parameter extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_code',
        'group_name',
        'description',
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
     * Get data parameter values
     */
    public function values(): HasMany
    {
        return $this->hasMany(ParameterValue::class);
    }

    /**
     * Scope hanya parameter aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
