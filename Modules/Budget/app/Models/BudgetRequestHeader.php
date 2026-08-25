<?php

namespace Modules\Budget\Models;

use App\Models\User;
use App\Traits\HasApprovalHistory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Budget\Models\BudgetRequestActivity;
use Modules\DataMaster\Models\AcademicPeriod;
use Modules\DataMaster\Models\BudgetCategory;
use Modules\DataMaster\Models\FiscalYear;
use Modules\DataMaster\Models\Unit;

class BudgetRequestHeader extends Model
{
    use HasApprovalHistory;

    protected $fillable = [
        'request_no',
        'request_date',
        'fiscal_year_id',
        'academic_period_id',
        'unit_id',
        'budget_type',
        'budget_category_id',
        'sub_budget_category_id',
        'notes',
        'total_amount',
        'status',
        'created_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'created_at',
        'updated_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'request_date' => 'date',
        'last_submitted_at' => 'datetime',
        'last_verified_at' => 'datetime',
        'last_approved_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi FiscalYear.
     */
    public function fiscalYear(): BelongsTo
    {
        return $this->belongsTo(FiscalYear::class);
    }

    /**
     * Relasi AcademicPeriod.
     */
    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    /**
     * Relasi Budget Category.
     */

    public function budgetCategory(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'budget_category_id');
    }

    /**
     * Relasi Budget Category.
     */

    public function subBudgetCategory(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'sub_budget_category_id');
    }

    /**
     * Relasi Unit.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Relasi User
     *
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi BudgetRequestActivity
     *
     */
    public function requestActivities(): HasMany
    {
        return $this->hasMany(BudgetRequestActivity::class, 'budget_request_header_id');
    }

    /**
     * Relasi BudgetRequestApproval
     *
     */
    public function currentApproval()
    {
        return $this->hasOne(BudgetRequestApproval::class)
            ->where('is_current', 1);
    }

    protected static function booted()
    {
        static::creating(function ($model) {
            $model->request_no = self::generateRequestNo($model);
            $model->created_by = Auth::id();
        });

        static::saving(function ($model) {
        if ($model->sub_budget_category_id === 'null' || $model->sub_budget_category_id === '') {
            $model->sub_budget_category_id = null;
        }
    });
    }

    public static function generateRequestNo($model): string
    {
        $academicPeriod = $model->relationLoaded('academicPeriod')
            ? $model->academicPeriod
            : AcademicPeriod::find($model->academic_period_id);

        if (!$academicPeriod) {
            throw new \Exception('Academic period not found');
        }

        $periodCode = str_replace('/', '-', $academicPeriod->academic_year);

        $unitCode = DB::table('units')
            ->where('id', $model->unit_id)
            ->value('unit_code') ?? 'UNIT';

        $prefix = "PA/{$periodCode}/{$unitCode}";

        $lastRequest = DB::table('budget_request_headers')
            ->where('request_no', 'like', "{$prefix}/%")
            ->orderBy('id', 'desc')
            ->lockForUpdate()
            ->select('request_no')
            ->first();

        $lastNumber = 0;
        if ($lastRequest) {
            $segments = explode('/', $lastRequest->request_no);
            $lastNumber = (int) end($segments);
        }

        $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}/{$nextNumber}";
    }

    /**
     * Scope untuk filter berdasarkan periode akademik.
     */
    public function scopeByAcademicPeriod($query, $academicPeriodId)
    {
        return $query->where('academic_period_id', $academicPeriodId);
    }

    /**
     * Scope untuk filter berdasarkan unit.
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Scope untuk filter berdasarkan status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk filter berdasarkan tipe budget.
     */
    public function scopeByBudgetType($query, $budgetType)
    {
        return $query->where('budget_type', $budgetType);
    }

    /**
     * Scope untuk filter berdasarkan rentang tanggal.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('request_date', [$startDate, $endDate]);
    }

    /**
     * Cek apakah budget request sudah disubmit.
     *
     * @return bool
     */
    public function isSubmitted(): bool
    {
        return !is_null($this->last_submitted_at);
    }

    /**
     * Cek apakah budget request sudah diverifikasi.
     *
     * @return bool
     */
    public function isVerified(): bool
    {
        return !is_null($this->last_verified_at);
    }

    /**
     * Cek apakah budget request sudah disetujui.
     *
     * @return bool
     */
    public function isApproved(): bool
    {
        return !is_null($this->last_approved_at);
    }

    /**
     * Format total amount dengan pemisah ribuan.
     *
     * @return string
     */
    public function getFormattedTotalAmountAttribute(): string
    {
        return number_format($this->total_amount, 2, ',', '.');
    }
}
