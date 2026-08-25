<?php

namespace Modules\Transaction\Services;

use Modules\Transaction\Models\FundTransfer;
use Modules\Transaction\Models\CashMutation;
use Modules\DataMaster\Models\FundSource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashMutationService
{
    /**
     * Create cash mutations from fund transfer.
     */
    public function createFromFundTransfer(FundTransfer $fundTransfer): void
    {
        try {
            DB::beginTransaction();

            $fromFundSource = FundSource::findOrFail($fundTransfer->from_fund_source_id);
            $toFundSource = FundSource::findOrFail($fundTransfer->to_fund_source_id);

            // Kalkulasi untuk balance baru
            $fromNewBalance = $fromFundSource->balance - $fundTransfer->amount;
            $toNewBalance = $toFundSource->balance + $fundTransfer->amount;

            // Create cash mutation OUT (asal)
            CashMutation::create([
                'mutation_date' => $fundTransfer->transfer_date,
                'fund_source_id' => $fundTransfer->from_fund_source_id,
                'type' => 'out',
                'amount' => $fundTransfer->amount,
                'description' => 'Transfer to ' . $toFundSource->name . ' (Ref: ' . $fundTransfer->transfer_no . ')',
                'source_type' => FundTransfer::class,
                'source_id' => $fundTransfer->id,
                'balance' => $fromNewBalance,
                'notes' => $fundTransfer->notes,
            ]);

            // Create cash mutation IN (tujuan)
            CashMutation::create([
                'mutation_date' => $fundTransfer->transfer_date,
                'fund_source_id' => $fundTransfer->to_fund_source_id,
                'type' => 'in',
                'amount' => $fundTransfer->amount,
                'description' => 'Transfer from ' . $fromFundSource->name . ' (Ref: ' . $fundTransfer->transfer_no . ')',
                'source_type' => FundTransfer::class,
                'source_id' => $fundTransfer->id,
                'balance' => $toNewBalance,
                'notes' => $fundTransfer->notes,
            ]);

            DB::commit();

            Log::info('Cash mutations created for fund transfer', [
                'transfer_id' => $fundTransfer->id,
                'transfer_no' => $fundTransfer->transfer_no,
                'from_fund_source_id' => $fundTransfer->from_fund_source_id,
                'to_fund_source_id' => $fundTransfer->to_fund_source_id,
                'amount' => $fundTransfer->amount,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create cash mutations', [
                'transfer_id' => $fundTransfer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Reverse cash mutations from fund transfer.
     */
    public function reverseFromFundTransfer(FundTransfer $fundTransfer): void
    {
        try {
            DB::beginTransaction();

            $cashMutations = CashMutation::where('source_type', FundTransfer::class)
                ->where('source_id', $fundTransfer->id)
                ->get();

            if ($cashMutations->isEmpty()) {
                Log::warning('No cash mutations found to reverse', [
                    'transfer_id' => $fundTransfer->id,
                ]);
                DB::commit();
                return;
            }

            foreach ($cashMutations as $mutation) {
                Log::info('Reversing cash mutation', [
                    'mutation_id' => $mutation->id,
                    'mutation_no' => $mutation->mutation_no,
                    'fund_source_id' => $mutation->fund_source_id,
                    'type' => $mutation->type,
                    'amount' => $mutation->amount,
                ]);
                
                $mutation->delete();
            }

            DB::commit();

            Log::info('Cash mutations reversed for fund transfer', [
                'transfer_id' => $fundTransfer->id,
                'transfer_no' => $fundTransfer->transfer_no,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to reverse cash mutations', [
                'transfer_id' => $fundTransfer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Update cash mutations from fund transfer.
     */
    public function updateFromFundTransfer(FundTransfer $fundTransfer): void
    {
        $this->reverseFromFundTransfer($fundTransfer);
        $this->createFromFundTransfer($fundTransfer);
    }
}