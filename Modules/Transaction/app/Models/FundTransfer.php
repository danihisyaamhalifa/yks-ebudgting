<?php

namespace Modules\Transaction\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Auth;
use Modules\DataMaster\Models\FundSource;

class FundTransfer extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'transfer_no',
        'transfer_date',
        'from_fund_source_id',
        'to_fund_source_id',
        'transfer_type',
        'amount',
        'source_type',
        'source_id',
        'status',
        'completed_at',
        'reference_no',
        'notes',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'transfer_date' => 'date',
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'draft',
    ];

    /**
     * Get the source fund source.
     */
    public function fromFundSource(): BelongsTo
    {
        return $this->belongsTo(FundSource::class, 'from_fund_source_id');
    }

    /**
     * Get the destination fund source.
     */
    public function toFundSource(): BelongsTo
    {
        return $this->belongsTo(FundSource::class, 'to_fund_source_id');
    }

    /**
     * Get the parent source model (polymorphic).
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get all cash mutations for this fund transfer.
     */
    public function cashMutations(): MorphMany
    {
        return $this->morphMany(CashMutation::class, 'source');
    }

    /**
     * Get the user who created the transfer.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the transfer.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if transfer is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if transfer is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if transfer is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if transfer has cash mutations.
     */
    public function hasCashMutations(): bool
    {
        return $this->cashMutations()->exists();
    }

    /**
     * Mark the transfer as completed.
     */
    public function markAsCompleted(): bool
    {
        if ($this->isCompleted()) {
            return false;
        }

        return $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark the transfer as cancelled.
     */
    public function markAsCancelled(): bool
    {
        if ($this->isCancelled()) {
            return false;
        }

        return $this->update([
            'status' => 'cancelled',
        ]);
    }

    /**
     * Scope a query to only include transfers with specific status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include draft transfers.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope a query to only include completed transfers.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include cancelled transfers.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transfer_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by fund source (either from or to).
     */
    public function scopeByFundSource($query, $fundSourceId)
    {
        return $query->where(function ($q) use ($fundSourceId) {
            $q->where('from_fund_source_id', $fundSourceId)
              ->orWhere('to_fund_source_id', $fundSourceId);
        });
    }

    /**
     * Scope a query to filter by transfer type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('transfer_type', $type);
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (FundTransfer $fundTransfer) {
            if (empty($fundTransfer->transfer_no)) {
                $fundTransfer->transfer_no = 'TRF-' . date('Ymd') . '-' . strtoupper(uniqid());
            }

            if (Auth::check()) {
                $fundTransfer->created_by = Auth::id();
                $fundTransfer->updated_by = Auth::id();
            }
        });

        static::updating(function (FundTransfer $fundTransfer) {
            if (Auth::check()) {
                $fundTransfer->updated_by = Auth::id();
            }
        });
    }
}