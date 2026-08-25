<?php

namespace Modules\Transaction\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Auth;
use Modules\DataMaster\Models\FundSource;

class CashMutation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cash_mutations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'mutation_no',
        'mutation_date',
        'fund_source_id',
        'type',
        'amount',
        'description',
        'source_type',
        'source_id',
        'balance',
        'notes',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'mutation_date' => 'date',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the fund source that owns the cash mutation.
     */
    public function fundSource(): BelongsTo
    {
        return $this->belongsTo(FundSource::class);
    }

    /**
     * Get the creator of the cash mutation.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the parent source model (polymorphic).
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Check if this is a cash in mutation.
     */
    public function isCashIn(): bool
    {
        return $this->type === 'in';
    }

    /**
     * Check if this is a cash out mutation.
     */
    public function isCashOut(): bool
    {
        return $this->type === 'out';
    }

    /**
     * Scope a query to only include "in" type mutations.
     */
    public function scopeTypeIn($query)
    {
        return $query->where('type', 'in');
    }

    /**
     * Scope a query to only include "out" type mutations.
     */
    public function scopeTypeOut($query)
    {
        return $query->where('type', 'out');
    }

    /**
     * Scope a query to filter by fund source.
     */
    public function scopeByFundSource($query, $fundSourceId)
    {
        return $query->where('fund_source_id', $fundSourceId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('mutation_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to get mutations for specific source.
     */
    public function scopeBySource($query, string $sourceType, int $sourceId)
    {
        return $query->where('source_type', $sourceType)
                     ->where('source_id', $sourceId);
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (CashMutation $cashMutation) {
            if (empty($cashMutation->mutation_no)) {
                $cashMutation->mutation_no = 'CSM-' . date('Ymd') . '-' . strtoupper(uniqid());
            }

            if (Auth::check()) {
                $cashMutation->created_by = Auth::id();
            }
        });
    }
}