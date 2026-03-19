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
        // Při update (PATCH) jsou všechna pole volitelná, při store (POST) je name povinné
        $isUpdate = $this->isMethod('PATCH');

        return [
            'name'       => $isUpdate ? 'sometimes|string|max:200' : 'required|string|max:200',
            'quantity'   => 'sometimes|numeric|min:0.01',
            'unit'       => 'nullable|string|max:20',
            'price'      => 'nullable|numeric|min:0',
            'notes'      => 'nullable|string|max:255',
            'is_checked' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ];
    }
}
