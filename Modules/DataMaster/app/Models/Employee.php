<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
// use Modules\DataMaster\Database\Factories\EmployeeFactory;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'nik',
        'name',
        'unit_id',
        'employee_type_id',
        'phone',
        'email',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function employeeType(): BelongsTo
    {
        return $this->belongsTo(ParameterValue::class, 'employee_type_id');
    }

    /**
     * Scoopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

}