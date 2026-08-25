<?php

namespace Modules\Disbursement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetFundReleaseRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $fundReleaseId = $this->getFundReleaseId();

        $rules = [
            'fund_release_no' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('budget_fund_releases', 'fund_release_no')->ignore($this->route('budget_fund_release'))
            ],

            'fund_release_date' => 'required|date',
            'budget_disbursement_header_id' => 'required|exists:budget_disbursement_headers,id',
            'fund_source_id' => 'nullable|exists:fund_sources,id',
            'recipient_bank_name' => 'nullable|string|max:100',
            'recipient_account_no' => 'nullable|string|max:30',
            'recipient_account_name' => 'nullable|string|max:100',
            'recipient_name' => 'nullable|string|max:100',
            'recipient_position' => 'nullable|string|max:100',
            'recipient_department' => 'nullable|string|max:100',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240',

            // Validasi untuk items
            'items' => 'required|array|min:1',
            'items.*.budget_disbursement_item_id' => 'required|exists:budget_disbursement_items,id',
            'items.*.total_amount' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ];

        return $rules;
    }

    private function getFundReleaseId()
    {
        return $this->route('budget_fund_release')
            ?? $this->route('id')
            ?? $this->input('id')
            ?? null;
    }
}
