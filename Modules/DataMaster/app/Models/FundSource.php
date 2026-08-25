<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Transaction\Models\CashMutation;
use Modules\Transaction\Models\FundTransfer;

class FundSource extends Model
{
    use HasFactory;

    protected $table = 'fund_sources';

    protected $fillable = [
        'code',
        'name',
        'fund_source_type',
        'cash_bank_id',
        'fund_source_owner',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * Get current balance from latest cash mutation.
     */
    public function getBalanceAttribute(): float
    {
        $lastMutation = $this->cashMutations()
            ->latest('mutation_date')
            ->latest('id')
            ->first();

        return $lastMutation ? (float) $lastMutation->balance : 0;
    }

    /**
     * Get the cash bank associated with this fund source.
     */
    public function cashBank()
    {
        return $this->belongsTo(CashBank::class);
    }

    /**
     * Get the cash mutations for this fund source.
     */
    public function cashMutations()
    {
        return $this->hasMany(CashMutation::class, 'fund_source_id');
    }

    /**
     * Get the fund transfers from this fund source.
     */
    public function outgoingTransfers()
    {
        return $this->hasMany(FundTransfer::class, 'from_fund_source_id');
    }

    /**
     * Get the fund transfers to this fund source.
     */
    public function incomingTransfers()
    {
        return $this->hasMany(FundTransfer::class, 'to_fund_source_id');
    }

     /**
     * Check if this is a institut.
     */
    public function isInstitut(): bool
    {
        return $this->fund_source_owner === 'institut';
    }

    /**
     * Check if balance is sufficient.
     */
    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Get formatted balance.
     */
    public function getFormattedBalanceAttribute(): string
    {
        return number_format($this->balance, 2);
    }

    /**
     * Scope a query to only include active fund sources.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
