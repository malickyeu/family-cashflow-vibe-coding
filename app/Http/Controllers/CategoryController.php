<?php

namespace App\Http\Controllers;

use App\Http\Traits\ResolvesFamily;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use ResolvesFamily;

    public function index(): Response
    {
        return Inertia::render('Categories/Index', [
            'categories' => Category::forContext($this->currentFamilyId(), auth()->id())
                ->orderByDesc('is_predefined')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:60',
            'color' => 'required|string|max:7',
            'icon'  => 'nullable|string|max:50',
            'type'  => 'required|in:income,expense,both',
        ]);

        Category::create([
            ...$validated,
            'user_id'       => auth()->id(),
            'family_id'     => $this->currentFamilyId(),
            'is_predefined' => false,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        // Only allow editing own categories
        if ($category->is_predefined) {
            return back()->with('error', 'Cannot edit predefined categories.');
        }

        $validated = $request->validate([
            'name'  => 'required|string|max:60',
            'color' => 'required|string|max:7',
            'icon'  => 'nullable|string|max:50',
            'type'  => 'required|in:income,expense,both',
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->is_predefined) {
            return back()->with('error', 'Cannot delete predefined categories.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
