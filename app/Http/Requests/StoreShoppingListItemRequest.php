<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreShoppingListItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:200',
            'quantity'   => 'required|numeric|min:0.01',
            'unit'       => 'nullable|string|max:20',
            'notes'      => 'nullable|string|max:255',
            'is_checked' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
