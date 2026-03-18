<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class LocaleController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'locale' => ['required', 'in:en,cs'],
        ]);

        $locale = $request->input('locale');

        session(['locale' => $locale]);

        if ($request->user()) {
            $request->user()->update(['locale' => $locale]);
        }

        return back();
    }
}
