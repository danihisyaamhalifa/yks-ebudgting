<?php

namespace App\Traits;

use App\Models\ApprovalHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasApprovalHistory
{
    
    public function approvalHistories(): MorphMany
    {
        return $this->morphMany(ApprovalHistory::class, 'approvable');
    }

    public function recordApproval(
        string $action,
        string $fromStatus,
        string $toStatus,
        ?string $notes = null
    ): ApprovalHistory {
        $lastSequence = $this->approvalHistories()
            ->where('action', '!=', 'revise')
            ->max('sequence') ?? 0;

        $sequence = in_array($action, ['submit', 'revise'])
            ? $lastSequence + 1
            : $lastSequence;

        return $this->approvalHistories()->create([
            'sequence' => $sequence,
            'action' => $action,
            'user_id' => Auth::id(),
            'user_name' => Auth::user()?->name,
            'user_role' => Auth::user()?->roles?->first()?->name,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'notes' => $notes,
            'action_at' => now(),
        ]);
    }
}