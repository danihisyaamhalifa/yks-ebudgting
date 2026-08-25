<?php

namespace Modules\Disbursement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\DataMaster\Models\FundSource;
use Modules\Disbursement\Models\BudgetAccountability;

class BudgetAccountabilityReturn extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_accountability_returns';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_accountability_id',
        'return_date',
        'amount',
        'receipt_no',
        'fund_source_id',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'return_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the budget accountability that owns this return.
     */
    public function budgetAccountability(): BelongsTo
    {
        return $this->belongsTo(BudgetAccountability::class, 'budget_accountability_id');
    }

    /**
     * Get the fund source that owns this return.
     */
    public function fundSource(): BelongsTo
    {
        return $this->belongsTo(FundSource::class, 'fund_source_id');
    }
}