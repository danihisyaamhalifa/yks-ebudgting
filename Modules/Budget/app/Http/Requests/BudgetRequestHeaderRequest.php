<?php

namespace Modules\Budget\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

            // Activities (top-level: bisa parent/grouping atau leaf)
            'budget_request_activities' => 'required|array|min:1',
            'budget_request_activities.*.activity_id' => 'required|exists:activities,id',
            'budget_request_activities.*.description' => 'nullable|string',
            'budget_request_activities.*.output_indicator' => 'nullable|string',
            'budget_request_activities.*.start_date' => 'nullable|date',
            'budget_request_activities.*.end_date' => 'nullable|date',
            'budget_request_activities.*.total_amount' => 'required|numeric|min:0',

            // Items (top-level leaf)
            'budget_request_activities.*.request_items' => 'nullable|array',
            'budget_request_activities.*.request_items.*.activity_item_id' => 'required|exists:activity_items,id',
            'budget_request_activities.*.request_items.*.description' => 'required|string|max:255',
            'budget_request_activities.*.request_items.*.unit_measure_id' => 'required|exists:parameter_values,id',
            'budget_request_activities.*.request_items.*.volume' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.unit_price' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.total_amount' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.calculation_mode' => 'nullable|in:simple,detailed',
            'budget_request_activities.*.request_items.*.notes' => 'nullable|string',

            // Multipliers (pengali volume dinamis, contoh: 14 hari x 50 mhs)
            'budget_request_activities.*.request_items.*.multipliers' => 'nullable|array',
            'budget_request_activities.*.request_items.*.multipliers.*.id' => 'nullable|integer|exists:budget_request_item_multipliers,id',
            'budget_request_activities.*.request_items.*.multipliers.*.sequence' => 'nullable|integer|min:1',
            'budget_request_activities.*.request_items.*.multipliers.*.label' => 'nullable|string|max:60',
            'budget_request_activities.*.request_items.*.multipliers.*.value' => 'required|numeric|gt:0',

            // Goods (top-level items)
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

            // Employees (top-level items, tipe EMPLOYEE: honorarium dosen)
            'budget_request_activities.*.request_items.*.employees' => 'nullable|array',
            'budget_request_activities.*.request_items.*.employees.*.id' => 'nullable|integer|exists:budget_request_item_employees,id',
            'budget_request_activities.*.request_items.*.employees.*.nik' => 'required|string|max:30',
            'budget_request_activities.*.request_items.*.employees.*.employee_name' => 'required|string|max:150',
            'budget_request_activities.*.request_items.*.employees.*.functional_position' => 'nullable|string|max:100',
            'budget_request_activities.*.request_items.*.employees.*.teaching_hours' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.employees.*.class_count' => 'required|integer|min:0',
            'budget_request_activities.*.request_items.*.employees.*.rate' => 'required|numeric|min:0',
            'budget_request_activities.*.request_items.*.employees.*.total' => 'nullable|numeric|min:0',
            'budget_request_activities.*.request_items.*.employees.*.notes' => 'nullable|string|max:500',

            // Children (sub-kegiatan)
            'budget_request_activities.*.children' => 'nullable|array',
            'budget_request_activities.*.children.*.activity_id' => 'required|exists:activities,id',
            'budget_request_activities.*.children.*.description' => 'nullable|string',
            'budget_request_activities.*.children.*.output_indicator' => 'nullable|string',
            'budget_request_activities.*.children.*.start_date' => 'nullable|date',
            'budget_request_activities.*.children.*.end_date' => 'nullable|date',
            'budget_request_activities.*.children.*.total_amount' => 'required|numeric|min:0',

            // Items (children)
            'budget_request_activities.*.children.*.request_items' => 'nullable|array',
            'budget_request_activities.*.children.*.request_items.*.activity_item_id' => 'required|exists:activity_items,id',
            'budget_request_activities.*.children.*.request_items.*.description' => 'required|string|max:255',
            'budget_request_activities.*.children.*.request_items.*.unit_measure_id' => 'required|exists:parameter_values,id',
            'budget_request_activities.*.children.*.request_items.*.volume' => 'required|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.unit_price' => 'required|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.total_amount' => 'required|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.calculation_mode' => 'nullable|in:simple,detailed',
            'budget_request_activities.*.children.*.request_items.*.notes' => 'nullable|string',

            // Multipliers (children items)
            'budget_request_activities.*.children.*.request_items.*.multipliers' => 'nullable|array',
            'budget_request_activities.*.children.*.request_items.*.multipliers.*.id' => 'nullable|integer|exists:budget_request_item_multipliers,id',
            'budget_request_activities.*.children.*.request_items.*.multipliers.*.sequence' => 'nullable|integer|min:1',
            'budget_request_activities.*.children.*.request_items.*.multipliers.*.label' => 'nullable|string|max:60',
            'budget_request_activities.*.children.*.request_items.*.multipliers.*.value' => 'required|numeric|gt:0',

            // Goods (children items)
            'budget_request_activities.*.children.*.request_items.*.goods' => 'nullable|array',
            'budget_request_activities.*.children.*.request_items.*.goods.*.id' => 'nullable|integer|exists:budget_request_item_goods,id',
            'budget_request_activities.*.children.*.request_items.*.goods.*.item_name' => 'required|string|max:255',
            'budget_request_activities.*.children.*.request_items.*.goods.*.goods_type' => 'required|in:bhp,non_bhp',
            'budget_request_activities.*.children.*.request_items.*.goods.*.specification' => 'nullable|string',
            'budget_request_activities.*.children.*.request_items.*.goods.*.brand' => 'nullable|string|max:255',
            'budget_request_activities.*.children.*.request_items.*.goods.*.quantity' => 'required|integer|min:1',
            'budget_request_activities.*.children.*.request_items.*.goods.*.unit_measure' => 'nullable|string|max:30',
            'budget_request_activities.*.children.*.request_items.*.goods.*.unit_price' => 'required|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.goods.*.notes' => 'nullable|string|max:500',

            // Employees (children items)
            'budget_request_activities.*.children.*.request_items.*.employees' => 'nullable|array',
            'budget_request_activities.*.children.*.request_items.*.employees.*.id' => 'nullable|integer|exists:budget_request_item_employees,id',
            'budget_request_activities.*.children.*.request_items.*.employees.*.nik' => 'required|string|max:30',
            'budget_request_activities.*.children.*.request_items.*.employees.*.employee_name' => 'required|string|max:150',
            'budget_request_activities.*.children.*.request_items.*.employees.*.functional_position' => 'nullable|string|max:100',
            'budget_request_activities.*.children.*.request_items.*.employees.*.teaching_hours' => 'required|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.employees.*.class_count' => 'required|integer|min:0',
            'budget_request_activities.*.children.*.request_items.*.employees.*.rate' => 'required|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.employees.*.total' => 'nullable|numeric|min:0',
            'budget_request_activities.*.children.*.request_items.*.employees.*.notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Validasi konsistensi struktur parent/child.
     */
    public function withValidator($validator): void
    {
        $validator->after(function (Validator $validator) {
            $activities = $this->input('budget_request_activities', []);

            foreach ($activities as $index => $activityData) {
                $hasItems = !empty($activityData['request_items']);
                $hasChildren = !empty($activityData['children']);

                if ($hasItems && $hasChildren) {
                    $validator->errors()->add(
                        "budget_request_activities.{$index}",
                        'Aktivitas tidak boleh memiliki item sekaligus sub-kegiatan.'
                    );
                }

                if (!$hasItems && !$hasChildren) {
                    $validator->errors()->add(
                        "budget_request_activities.{$index}",
                        'Aktivitas harus memiliki minimal satu item atau satu sub-kegiatan.'
                    );
                }

                if ($hasChildren) {
                    foreach ($activityData['children'] as $childIndex => $childData) {
                        if (empty($childData['request_items'])) {
                            $validator->errors()->add(
                                "budget_request_activities.{$index}.children.{$childIndex}.request_items",
                                'Sub-kegiatan harus memiliki minimal satu item.'
                            );
                        }
                    }
                }
            }
        });
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
