<?php

namespace Modules\Disbursement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetDisbursementHeaderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $disbursementId = $this->getDisbursementId();

        return [
            'disbursement_no' => [
                'nullable',
                'string',
                Rule::unique('budget_disbursement_headers', 'disbursement_no')->ignore($disbursementId)
            ],
            'disbursement_date' => 'required|date',
            'budget_request_header_id' => 'required|exists:budget_request_headers,id',
            'budget_request_activity_id' => 'required|exists:budget_request_activities,id',
            'total_amount' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $itemsTotal = collect($this->input('items'))->sum('total_amount');
                    if ($value != $itemsTotal) {
                        $fail('Total jumlah harus sama dengan jumlah seluruh item');
                    }
                }
            ],
            'status' => 'required|string',
            'notes' => 'nullable|string',

            'items' => 'required|array|min:1',
            'items.*.budget_request_item_id' => 'required|exists:budget_request_items,id',
            'items.*.total_amount' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];
                    $recipients = $this->input("items.{$index}.recipients");
                    
                    if (!empty($recipients)) {
                        $recipientsTotal = collect($recipients)->sum('amount');
                        if ($value != $recipientsTotal) {
                            $fail('Jumlah item harus sama dengan jumlah seluruh penerima');
                        }
                    }
                }
            ],
            'items.*.notes' => 'nullable|string',

            'items.*.recipients' => 'nullable|array',
            'items.*.recipients.*.recipient_type' => 'required_with:items.*.recipients|string|max:50',
            'items.*.recipients.*.recipient_id' => 'required_with:items.*.recipients|integer',
            'items.*.recipients.*.recipient_name' => 'required_with:items.*.recipients|string|max:150',
            'items.*.recipients.*.identity_no' => 'nullable|string|max:50',
            'items.*.recipients.*.bank_name' => 'nullable|string|max:100',
            'items.*.recipients.*.bank_account_no' => 'nullable|string|max:30',
            'items.*.recipients.*.bank_account_name' => 'nullable|string|max:100',
            'items.*.recipients.*.amount' => 'required_with:items.*.recipients|numeric|min:0',
            'items.*.recipients.*.notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'disbursement_no.unique' => 'Nomor pencairan sudah digunakan',
            'disbursement_date.required' => 'Tanggal pencairan wajib diisi',
            'disbursement_date.date' => 'Format tanggal pencairan tidak valid',
            'budget_request_header_id.required' => 'Header pengajuan anggaran wajib dipilih',
            'budget_request_header_id.exists' => 'Header pengajuan anggaran tidak valid',
            'budget_request_activity_id.required' => 'Kegiatan anggaran wajib dipilih',
            'budget_request_activity_id.exists' => 'Kegiatan anggaran tidak valid',
            'total_amount.required' => 'Total jumlah wajib diisi',
            'total_amount.numeric' => 'Total jumlah harus berupa angka',
            'total_amount.min' => 'Total jumlah tidak boleh negatif',
            'status.required' => 'Status wajib diisi',
            
            'items.required' => 'Minimal harus ada satu item',
            'items.array' => 'Format items tidak valid',
            'items.min' => 'Minimal harus ada satu item',
            'items.*.budget_request_item_id.required' => 'Item anggaran wajib dipilih',
            'items.*.budget_request_item_id.exists' => 'Item anggaran tidak valid',
            'items.*.total_amount.required' => 'Jumlah item wajib diisi',
            'items.*.total_amount.numeric' => 'Jumlah item harus berupa angka',
            'items.*.total_amount.min' => 'Jumlah item tidak boleh negatif',
            
            'items.*.recipients.array' => 'Format penerima tidak valid',
            'items.*.recipients.*.recipient_type.required_with' => 'Tipe penerima wajib diisi',
            'items.*.recipients.*.recipient_type.max' => 'Tipe penerima maksimal 50 karakter',
            'items.*.recipients.*.recipient_id.required_with' => 'Pegawai atau vendor wajib dipilih',
            'items.*.recipients.*.recipient_id.integer' => 'ID pegawai atau vendor harus berupa angka',
            'items.*.recipients.*.recipient_name.required_with' => 'Nama pegawai atau vendor wajib diisi',
            'items.*.recipients.*.recipient_name.max' => 'Nama pegawai atau vendor maksimal 150 karakter',
            'items.*.recipients.*.amount.required_with' => 'Jumlah pembayaran wajib diisi',
            'items.*.recipients.*.amount.numeric' => 'Jumlah pembayaran harus berupa angka',
            'items.*.recipients.*.amount.min' => 'Jumlah pembayaran tidak boleh negatif',
            'items.*.recipients.*.identity_no.max' => 'Nomor identitas maksimal 50 karakter',
            'items.*.recipients.*.bank_name.max' => 'Nama bank maksimal 100 karakter',
            'items.*.recipients.*.bank_account_no.max' => 'Nomor rekening maksimal 30 karakter',
            'items.*.recipients.*.bank_account_name.max' => 'Nama pemilik rekening maksimal 100 karakter',
        ];
    }

    private function getDisbursementId()
    {
        return $this->route('budget_disbursement')
            ?? $this->route('id')
            ?? $this->input('id')
            ?? null;
    }
}