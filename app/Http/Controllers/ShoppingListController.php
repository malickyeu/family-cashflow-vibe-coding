<?php

namespace App\Http\Controllers;

use App\Http\Traits\ResolvesFamily;
use App\Models\ShoppingList;
use App\Http\Requests\StoreShoppingListRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShoppingListController extends Controller
{
    use ResolvesFamily;

    public function index(Request $request): Response
    {
        $showArchived = $request->boolean('archived', false);

        $lists = $this->applyScope(ShoppingList::with(['creator', 'items']), 'created_by')
            ->where('is_archived', $showArchived)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($list) => [
                ...$list->toArray(),
                'progress'      => $list->progress,
                'item_count'    => $list->items->count(),
                'checked_count' => $list->items->where('is_checked', true)->count(),
            ]);

        return Inertia::render('Shopping/Index', [
            'lists'        => $lists,
            'showArchived' => $showArchived,
            'currency'     => config('app.currency', 'CZK'),
        ]);
    }

    public function store(StoreShoppingListRequest $request): RedirectResponse
    {
        $list = ShoppingList::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
            'family_id'  => $this->currentFamilyId(),
        ]);

        return redirect()->route('shopping.show', $list)
            ->with('success', 'Shopping list created.');
    }

    public function show(ShoppingList $shopping): Response
    {
        $shopping->load(['items.checkedByUser', 'creator']);

        $totalPrice = $shopping->items->sum(fn($item) => ($item->price ?? 0) * $item->quantity);
        $paidPrice = $shopping->items->where('is_checked', true)->sum(fn($item) => ($item->price ?? 0) * $item->quantity);

        return Inertia::render('Shopping/Show', [
            'list' => array_merge($shopping->toArray(), [
                'progress' => $shopping->progress,
                'total_price' => (float) $totalPrice,
                'paid_price' => (float) $paidPrice,
            ]),
            'currency' => config('app.currency', 'CZK'),
        ]);
    }

    public function update(StoreShoppingListRequest $request, ShoppingList $shopping): RedirectResponse
    {
        $shopping->update($request->validated());

        return back()->with('success', 'Shopping list updated.');
    }

    public function destroy(ShoppingList $shopping): RedirectResponse
    {
        $shopping->delete();

        return redirect()->route('shopping.index')
            ->with('success', 'Shopping list deleted.');
    }

    public function archive(ShoppingList $shopping): RedirectResponse
    {
        $shopping->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);

        return redirect()->route('shopping.index')
            ->with('success', 'Shopping list archived.');
    }

    public function clearChecked(ShoppingList $shopping): RedirectResponse
    {
        $shopping->items()->where('is_checked', true)->delete();

        return back()->with('success', 'Checked items cleared.');
    }
}
