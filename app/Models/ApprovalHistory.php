<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ApprovalHistory extends Model
{
    protected $fillable = [
        'approvable_type',
        'approvable_id',
        'sequence',
        'action',
        'user_id',
        'user_name',
        'user_role',
        'from_status',
        'to_status',
        'notes',
        'action_at',
    ];

    protected $casts = [
        'action_at' => 'datetime',
    ];

    public $timestamps = false;

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}