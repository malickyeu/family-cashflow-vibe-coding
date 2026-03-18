<?php

namespace App\Http\Controllers;

use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use App\Http\Requests\StoreShoppingListItemRequest;
use Illuminate\Http\RedirectResponse;

class ShoppingListItemController extends Controller
{
    public function store(StoreShoppingListItemRequest $request, ShoppingList $shopping): RedirectResponse
    {
        $shopping->items()->create($request->validated());

        return back()->with('success', 'Item added.');
    }

    public function update(StoreShoppingListItemRequest $request, ShoppingList $shopping, ShoppingListItem $item): RedirectResponse
    {
        $data = $request->validated();

        if (isset($data['is_checked']) && $data['is_checked'] && ! $item->is_checked) {
            $data['checked_by'] = auth()->id();
            $data['checked_at'] = now();
        } elseif (isset($data['is_checked']) && ! $data['is_checked']) {
            $data['checked_by'] = null;
            $data['checked_at'] = null;
        }

        $item->update($data);

        return back();
    }

    public function destroy(ShoppingList $shopping, ShoppingListItem $item): RedirectResponse
    {
        $item->delete();

        return back()->with('success', 'Item removed.');
    }
}
