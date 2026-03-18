<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'en';

        if ($request->user()) {
            $locale = $request->user()->locale ?? session('locale', 'en');
        } else {
            $locale = session('locale', 'en');
        }

        if (!in_array($locale, ['en', 'cs'])) {
            $locale = 'en';
        }

        App::setLocale($locale);
        session(['locale' => $locale]);

        return $next($request);
    }
}
