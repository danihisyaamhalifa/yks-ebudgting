<?php

namespace Modules\Budget\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetRequestItemEmployee extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_request_item_employees';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_request_item_id',
        'nik',
        'employee_name',
        'functional_position',
        'teaching_hours',
        'class_count',
        'rate',
        'total',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'teaching_hours' => 'decimal:2',
        'class_count' => 'integer',
        'rate' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'teaching_hours' => 0,
        'class_count' => 1,
        'rate' => 0,
        'total' => 0,
    ];

    /**
     * Get the budget request item that owns this employee detail.
     */
    public function budgetRequestItem(): BelongsTo
    {
        return $this->belongsTo(BudgetRequestItem::class);
    }

    /**
     * Hitung total = jam mengajar × jumlah kelas × tarif.
     */
    public function calculateTotal(): void
    {
        $this->total = (float) $this->teaching_hours
            * (int) $this->class_count
            * (float) $this->rate;
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (BudgetRequestItemEmployee $employee) {
            if (empty($employee->total) || (float) $employee->total <= 0) {
                $employee->calculateTotal();
            }
        });

        static::updating(function (BudgetRequestItemEmployee $employee) {
            if ($employee->isDirty(['teaching_hours', 'class_count', 'rate'])) {
                $employee->calculateTotal();
            }
        });
    }
}
