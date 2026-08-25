<?php

namespace Modules\Budget\Http\Actions;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Budget\Models\BudgetRequestHeader;

class CreateBudgetRequestAction
{
    public function execute(array $data): BudgetRequestHeader
    {
        return DB::transaction(function () use ($data) {
            // 1. Simpan Header
            $header = BudgetRequestHeader::create(array_merge($data, [
                'status' => 'draft',
                'created_by' => Auth::id(),
            ]));

            // 2. Loop Activities
            foreach ($data['budget_request_activities'] as $activityData) {
                $activity = $header->requestActivities()->create($activityData);

                // 3. Simpan Items
                if (!empty($activityData['request_items'])) {
                    $activity->requestItems()->createMany($activityData['request_items']);
                }

                // 4. Simpan Documents (Logika upload bisa dipisah ke Action lain lagi)
                if (!empty($activityData['documents'])) {
                    $this->handleDocuments($activity, $activityData['documents']);
                }
            }

            return $header->load([
                'requestActivities.requestItems.coa',
                'requestActivities.requestItems.unitMeasure',
                'requestActivities.documents',
                'fiscalYear', 'academicPeriod', 'budgetType', 'unit'
            ]);
        });
    }

    protected function handleDocuments($activity, $documents)
    {
        foreach ($documents as $doc) {
            if (isset($doc['file'])) {
                $file = $doc['file'];
                $path = $file->storeAs(
                    'budget-request-activities/' . $activity->id,
                    time() . '_' . Str::slug($file->getClientOriginalName()),
                    'public'
                );

                $activity->documents()->create([
                    'document_name' => $doc['document_name'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getMimeType(),
                    'uploaded_by' => Auth::id(),
                ]);
            }
        }
    }
}