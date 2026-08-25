<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;

class CashBank extends Model
{
    protected $table = 'cash_banks';

    protected $fillable = [
        'code',
        'name',
        'type',
        'bank_name',
        'account_number',
        'account_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Constants
     */
    public const TYPE_CASH = 'cash';
    public const TYPE_BANK = 'bank';

    /**
     * Scopes
     *
     */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCash($query)
    {
        return $query->where('type', self::TYPE_CASH);
    }

    public function scopeBank($query)
    {
        return $query->where('type', self::TYPE_BANK);
    }

    /**
     * Accessor
     *
     */

    public function getDisplayNameAttribute()
    {
        if ($this->type === self::TYPE_BANK) {
            return "{$this->name} ({$this->bank_name})";
        }

        return $this->name;
    }

    /**
     * Helper
     *
     */
    public function isCash(): bool
    {
        return $this->type === self::TYPE_CASH;
    }

    public function isBank(): bool
    {
        return $this->type === self::TYPE_BANK;
    }
}
