<?php

namespace Modules\Disbursement\Models;

use App\Models\User;
use App\Traits\HasApprovalHistory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Budget\Models\BudgetRequestActivity;
use Modules\Budget\Models\BudgetRequestHeader;

class BudgetDisbursementHeader extends Model
{
    use HasApprovalHistory;
    
    protected $table = 'budget_disbursement_headers';

    protected $fillable = [
        'disbursement_no',
        'disbursement_date',
        'budget_request_header_id',
        'budget_request_activity_id',
        'total_amount',
        'notes',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'disbursement_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    protected $appends = [
        'released_amount',
        'remaining_amount'
    ];

    /**
     * INITIALIZATION 
     *
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            // Load relasi jika belum loaded
            if (!$model->relationLoaded('requestHeader')) {
                $model->load('requestHeader.unit', 'requestHeader.academicPeriod');
            }

            $model->disbursement_no = self::generateDisbursementNo($model); // Perbaiki nama field
            $model->created_by = Auth::id();
            $model->updated_by = Auth::id();
            $model->status = $model->status ?? 'draft';
        });
    }

    public static function generateDisbursementNo($model): string
    {
        // Cek apakah requestHeader ada
        if (!$model->requestHeader) {
            throw new \Exception('Budget Request Header not found');
        }

        // Ambil academic period dari relasi requestHeader
        $academicPeriod = $model->requestHeader->academicPeriod;

        if (!$academicPeriod) {
            throw new \Exception('Academic period not found');
        }

        // Format 2025/2026 -> 2025-2026
        $periodCode = str_replace('/', '-', $academicPeriod->academic_year);

        // Ambil unit code dari relasi requestHeader->unit
        $unitCode = $model->requestHeader->unit->unit_code ?? 'UNIT';

        // Prefix nomor
        $prefix = "PP/{$periodCode}/{$unitCode}";

        // Cari nomor terakhir dengan lock untuk concurrency
        $lastNumber = DB::table('budget_disbursement_headers')
            ->where('disbursement_no', 'like', "{$prefix}/%") // Perbaiki jadi disbursement_no
            ->lockForUpdate()
            ->max(DB::raw("CAST(SUBSTRING_INDEX(disbursement_no, '/', -1) AS UNSIGNED)")); // Perbaiki di sini juga

        $nextNumber = str_pad(($lastNumber ?? 0) + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}/{$nextNumber}";
    }

    /**
     * RELATIONSHIPS
     *
     */
    public function requestHeader(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestHeader::class, 'budget_request_header_id');
    }

    public function requestActivity(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestActivity::class, 'budget_request_activity_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BudgetDisbursementItem::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BudgetDisbursementDocument::class, 'budget_disbursement_header_id');
    }

    public function fundReleases(): HasMany
    {
        return $this->hasMany(BudgetFundRelease::class, 'budget_disbursement_header_id');
    }

    /**
     * Hitung total released amount menggunakan hasil dari eager load withSum di controller
     */
    public function getReleasedAmountAttribute(): float
    {
        return (float) ($this->attributes['fund_releases_sum_total_amount'] ?? 0);
    }

    /**
     * Hitung remaining amount (total_amount - released_amount)
     */
    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->total_amount - $this->released_amount;
    }
}
