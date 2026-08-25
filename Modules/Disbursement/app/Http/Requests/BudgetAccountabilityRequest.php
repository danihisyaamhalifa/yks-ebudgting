<?php

namespace Modules\Disbursement\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetAccountabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $accountabilityId = $this->route('id') ?? $this->route('budget_accountability');

        $rules = [
            'accountability_no' => [
                'nullable',
                'string',
                'max:30',
                Rule::unique('budget_accountabilities', 'accountability_no')->ignore($accountabilityId),
            ],
            'accountability_date' => 'required|date',
            'budget_fund_release_id' => 'required|exists:budget_fund_releases,id',
            'budget_fund_release_item_id' => 'nullable|exists:budget_fund_release_items,id',
            'total_received' => 'required|numeric|min:0',
            'total_spent' => 'required|numeric|min:0',
            'total_returned' => 'required|numeric|min:0',
            'status' => 'nullable|in:draft,submitted,verified,approved,returned',
            'notes' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',

            // Validasi untuk items (pengeluaran)
            'items' => 'nullable|array',
            'items.*.expense_date' => 'required_with:items|date',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.amount' => 'required_with:items|numeric|min:0',
            'items.*.receipt_no' => 'nullable|string|max:50',
            'items.*.notes' => 'nullable|string|max:255',

            // Validasi untuk returns (pengembalian)
            'returns' => 'nullable|array',
            'returns.*.return_date' => 'required_with:returns|date',
            'returns.*.amount' => 'required_with:returns|numeric|min:0',
            'returns.*.receipt_no' => 'nullable|string|max:50',
            'returns.*.fund_source_id' => 'nullable|exists:fund_sources,id',
            'returns.*.notes' => 'nullable|string|max:255',
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            // Accountability
            // 'accountability_no.required' => 'Nomor pertanggungjawaban wajib diisi.',
            'accountability_no.string' => 'Nomor pertanggungjawaban harus berupa teks.',
            'accountability_no.max' => 'Nomor pertanggungjawaban maksimal 30 karakter.',
            'accountability_no.unique' => 'Nomor pertanggungjawaban sudah digunakan.',

            'accountability_date.required' => 'Tanggal pertanggungjawaban wajib diisi.',
            'accountability_date.date' => 'Format tanggal pertanggungjawaban tidak valid.',

            'budget_fund_release_id.required' => 'Realisasi pencairan wajib dipilih.',
            'budget_fund_release_id.exists' => 'Realisasi pencairan yang dipilih tidak valid.',

            'budget_fund_release_item_id.exists' => 'Detail realisasi pencairan yang dipilih tidak valid.',

            // Total
            'total_received.required' => 'Total diterima wajib diisi.',
            'total_received.numeric' => 'Total diterima harus berupa angka.',
            'total_received.min' => 'Total diterima tidak boleh kurang dari 0.',

            'total_spent.required' => 'Total pengeluaran wajib diisi.',
            'total_spent.numeric' => 'Total pengeluaran harus berupa angka.',
            'total_spent.min' => 'Total pengeluaran tidak boleh kurang dari 0.',

            'total_returned.required' => 'Total pengembalian wajib diisi.',
            'total_returned.numeric' => 'Total pengembalian harus berupa angka.',
            'total_returned.min' => 'Total pengembalian tidak boleh kurang dari 0.',

            // Status
            'status.in' => 'Status yang dipilih tidak valid.',

            // Notes
            'notes.string' => 'Catatan pertanggungjawaban harus berupa teks.',

            // Files
            'files.array' => 'Format file tidak valid.',
            'files.*.file' => 'Berkas yang diunggah tidak valid.',
            'files.*.mimes' => 'Tipe file tidak diizinkan. Hanya file PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, dan PNG yang diperbolehkan.',
            'files.*.max' => 'Ukuran file maksimal 10MB.',

            // Items (Pengeluaran)
            'items.array' => 'Format item pengeluaran tidak valid.',

            'items.*.expense_date.required_with' => 'Tanggal pengeluaran pada item #:position wajib diisi.',
            'items.*.expense_date.date' => 'Format tanggal pengeluaran pada item #:position tidak valid.',

            'items.*.description.required_with' => 'Uraian pengeluaran pada item #:position wajib diisi.',
            'items.*.description.string' => 'Uraian pengeluaran pada item #:position harus berupa teks.',
            'items.*.description.max' => 'Uraian pengeluaran pada item #:position maksimal 255 karakter.',

            'items.*.amount.required_with' => 'Jumlah pengeluaran pada item #:position wajib diisi.',
            'items.*.amount.numeric' => 'Jumlah pengeluaran pada item #:position harus berupa angka.',
            'items.*.amount.min' => 'Jumlah pengeluaran pada item #:position tidak boleh kurang dari 0.',

            'items.*.receipt_no.string' => 'Nomor resi pada item #:position harus berupa teks.',
            'items.*.receipt_no.max' => 'Nomor resi pada item #:position maksimal 50 karakter.',

            'items.*.notes.string' => 'Keterangan pada item #:position harus berupa teks.',
            'items.*.notes.max' => 'Keterangan pada item #:position maksimal 255 karakter.',

            // Returns (Pengembalian)
            'returns.array' => 'Format item pengembalian tidak valid.',

            'returns.*.return_date.required_with' => 'Tanggal pengembalian pada item #:position wajib diisi.',
            'returns.*.return_date.date' => 'Format tanggal pengembalian pada item #:position tidak valid.',

            'returns.*.amount.required_with' => 'Jumlah pengembalian pada item #:position wajib diisi.',
            'returns.*.amount.numeric' => 'Jumlah pengembalian pada item #:position harus berupa angka.',
            'returns.*.amount.min' => 'Jumlah pengembalian pada item #:position tidak boleh kurang dari 0.',

            'returns.*.receipt_no.string' => 'Nomor resi/bukti pada item #:position harus berupa teks.',
            'returns.*.receipt_no.max' => 'Nomor resi/bukti pada item #:position maksimal 50 karakter.',

            'returns.*.fund_source_id.exists' => 'Sumber dana yang dipilih pada item #:position tidak valid.',

            'returns.*.notes.string' => 'Keterangan pada item #:position harus berupa teks.',
            'returns.*.notes.max' => 'Keterangan pada item #:position maksimal 255 karakter.',
        ];
    }
}