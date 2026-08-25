<?php

namespace Modules\Disbursement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\DataMaster\Models\FundSource;
use Modules\Transaction\Models\CashMutation;

class BudgetFundRelease extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_fund_releases';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fund_release_no',
        'fund_release_date',
        'budget_disbursement_header_id',
        'fund_source_id',
        'payment_type',
        'total_amount',
        'recipient_bank_name',
        'recipient_account_no',
        'recipient_account_name',
        'recipient_name',
        'recipient_position',
        'recipient_department',
        'status',
        'notes',
        'created_by'
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

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fund_release_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the disbursement header associated with this fund release.
     *
     */
    public function disbursementHeader()
    {
        return $this->belongsTo(BudgetDisbursementHeader::class, 'budget_disbursement_header_id');
    }

    /**
     * Get the fund source associated with this fund release.
     *
     */
    public function fundSource()
    {
        return $this->belongsTo(FundSource::class);
    }

    /**
     * Get the user who created this fund release.
     *
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this fund release.
     *
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the items associated with this fund release.
     *
     */
    public function items()
    {
        return $this->hasMany(BudgetFundReleaseItem::class);
    }

    /**
     * Get the documents associated with this fund release.
     *
     */
    public function documents()
    {
        return $this->hasMany(BudgetFundReleaseDocument::class, 'budget_fund_release_id');
    }

    /**
     * Get the cash mutations for this fund release.
     * 
     */
    public function cashMutations()
    {
        return $this->morphMany(CashMutation::class, 'source');
    }

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            // Load relationships if not already loaded
            if (!$model->relationLoaded('disbursementHeader')) {
                $model->load('disbursementHeader.requestHeader.unit', 'disbursementHeader.requestHeader.academicPeriod');
            }

            $model->fund_release_no = self::generateReleaseNo($model);
            $model->created_by = Auth::id();
            $model->updated_by = Auth::id();
        });
    }

    /**
     * Generate a unique fund release number.
     *
     * Format: RP/{academic_year}/{unit_code}/{sequential_number}
     * Contoh: RP/2025-2026/UN-001/0001
     *
     */
    public static function generateReleaseNo($model): string
    {
        // Check if disbursement header exists
        if (!$model->disbursementHeader) {
            throw new \Exception('Budget Disbursement Header not found');
        }

        // Get academic period from request header relationship
        $academicPeriod = $model->disbursementHeader->requestHeader->academicPeriod;

        if (!$academicPeriod) {
            throw new \Exception('Academic period not found');
        }

        // Format 2025/2026 -> 2025-2026
        $periodCode = str_replace('/', '-', $academicPeriod->academic_year);

        // Get unit code from request header relationship, fallback to 'UNIT' if not found
        $unitCode = $model->disbursementHeader->requestHeader->unit->unit_code ?? 'UNIT';

        // Prefix for the release number
        $prefix = "RP/{$periodCode}/{$unitCode}";

        // Find the last sequential number with lock for concurrency control
        $lastNumber = DB::table('budget_fund_releases')
            ->where('fund_release_no', 'like', "{$prefix}/%")
            ->lockForUpdate()
            ->max(DB::raw("CAST(SUBSTRING_INDEX(fund_release_no, '/', -1) AS UNSIGNED)"));

        // Calculate next sequential number (4 digits with leading zeros)
        $nextNumber = str_pad(($lastNumber ?? 0) + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}/{$nextNumber}";
    }
}