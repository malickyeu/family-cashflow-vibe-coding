<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'        => 'required|in:income,expense',
            'amount'      => 'required|numeric|min:0.01',
            'category_id' => 'nullable|exists:categories,id',
            'date'        => 'required|date',
            'description' => 'nullable|string|max:255',
            'user_id'     => 'required|exists:users,id',
        ];
    }
}
