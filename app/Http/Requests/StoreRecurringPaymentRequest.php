<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecurringPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                 => 'required|string|max:100',
            'amount'               => 'required|numeric|min:0.01',
            'frequency'            => 'required|in:monthly,yearly',
            'next_due_date'        => 'required|date',
            'category_id'          => 'nullable|exists:categories,id',
            'notes'                => 'nullable|string|max:500',
            'is_active'            => 'boolean',
            'send_reminder'        => 'boolean',
            'reminder_days_before' => 'integer|min:0|max:30',
        ];
    }
}
