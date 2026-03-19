<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $locale = App::getLocale();
        $translationPath = lang_path("{$locale}.json");
        $translations = File::exists($translationPath)
            ? json_decode(File::get($translationPath), true)
            : [];

        $user = $request->user();

        $currentFamily = null;
        $userFamilies  = [];

        if ($user) {
            $currentFamily = $user->currentFamily;
            $userFamilies  = $user->families()
                ->withPivot('role')
                ->get()
                ->map(fn ($f) => [
                    'id'         => $f->id,
                    'name'       => $f->name,
                    'pivot_role' => $f->pivot->role,
                ])
                ->values()
                ->all();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    ...$user->toArray(),
                    'is_admin' => $user->isAdmin(),
                ] : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'locale'        => $locale,
            'translations'  => $translations,
            'currentFamily' => $currentFamily,
            'userFamilies'  => $userFamilies,
        ];
    }
}
