<?php

namespace Modules\Disbursement\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\Disbursement\Database\Factories\BudgetDisbursementRecipientFactory;

class BudgetDisbursementRecipient extends Model
{
    use HasFactory;

    protected $table = 'budget_disbursement_recipients';

    protected $fillable = [
        'budget_disbursement_item_id',
        'recipient_type',
        'recipient_id',
        'recipient_name',
        'identity_no',
        'bank_name',
        'bank_account_no',
        'bank_account_name',
        'amount',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relasi ke header
    public function item()
    {
        return $this->belongsTo(BudgetDisbursementItem::class, 'budget_disbursement_item_id');
    }

    // Relasi polymorphic
    public function recipient()
    {
        return $this->morphTo();
    }
}