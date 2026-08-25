<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vendor extends Model
{
    use HasFactory;

    protected $table = 'vendors';

    protected $fillable = [
        'vendor_code',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'tax_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

     /**
     * Scoopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

}