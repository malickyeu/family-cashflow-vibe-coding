<?php

namespace App\Providers;

use App\Models\Family;
use App\Policies\FamilyPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Family::class, FamilyPolicy::class);
    }
}
