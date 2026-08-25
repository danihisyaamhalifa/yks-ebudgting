<?php

namespace Modules\Budget\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BudgetRequestHeaderRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {

        $id = $this->getRequestId();

        return [
            // Header
            'request_no' => 'nullable|string|unique:budget_request_headers,request_no,' . $id,
            'request_date' => 'required|date',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'academic_period_id' => 'required|exists:academic_periods,id',
            'budget_type' => 'required|in:budgeter,non_budgeter',
            'unit_id' => 'required|exists:units,id',
            'notes' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'total_amount' => 'required|numeric|min:0',

            // Activities
            'budget_request_activities' => 'required|array|min:1',
            'budget_request_activities.*.activity_id' => 'required|exists:activities,id',
            'budget_request_activities.*.description' => 'nullable|string',
            'budget_request_activities.*.output_indicator' => 'nullable|string',
            'budget_request_activities.*.total_amount' => 'required|numeric|min:0',

            // Items
            'budget_request_activities.*.request_items' => 'required|array|min:1',
            'budget_request_activities.*.request_items.*.activity_item_id' => 'required|exists:activity_items,id',
            'budget_request_activities.*.request_items.*.description' => 'required|string|max:255',
            'budget_request_activities.*.request_items.*.unit_measure_id' => 'required|exists:parameter_values,id',
            'budget_request_activities.*.request_items.*.volume' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.unit_price' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.total_amount' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.notes' => 'nullable|string',

            //Goods
            'budget_request_activities.*.request_items.*.goods' => 'nullable|array',
            'budget_request_activities.*.request_items.*.goods.*.id' => 'nullable|integer|exists:budget_request_item_goods,id',
            'budget_request_activities.*.request_items.*.goods.*.item_name' => 'required|string|max:255',
            'budget_request_activities.*.request_items.*.goods.*.goods_type' => 'required|in:bhp,non_bhp',
            'budget_request_activities.*.request_items.*.goods.*.specification' => 'nullable|string',
            'budget_request_activities.*.request_items.*.goods.*.brand' => 'nullable|string|max:255',
            'budget_request_activities.*.request_items.*.goods.*.quantity' => 'required|integer|min:1',
            'budget_request_activities.*.request_items.*.goods.*.unit_measure' => 'nullable|string|max:30',
            'budget_request_activities.*.request_items.*.goods.*.unit_price' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.goods.*.notes' => 'nullable|string|max:500',
            ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    private function getRequestId()
    {
        return $this->route('budget_request') 
            ?? $this->route('id') 
            ?? $this->input('id') 
            ?? null;
    }
}
