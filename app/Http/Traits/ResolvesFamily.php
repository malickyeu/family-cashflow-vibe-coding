<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;

trait ResolvesFamily
{
    /**
     * Vrátí ID aktuální rodiny přihlášeného uživatele (nebo null = osobní mód).
     */
    protected function currentFamilyId(): ?int
    {
        return auth()->user()?->current_family_id;
    }

    /**
     * Aplikuje scope pro aktuální kontext (osobní nebo rodinný).
     * V osobním módu filtruje podle user_id + family_id IS NULL.
     * V rodinném módu filtruje podle family_id.
     */
    protected function applyScope(Builder $query, string $userColumn = 'user_id'): Builder
    {
        $familyId = $this->currentFamilyId();

        if ($familyId) {
            return $query->where('family_id', $familyId);
        }

        return $query->where($userColumn, auth()->id())
                     ->whereNull('family_id');
    }

    /**
     * Vrátí seznam uživatelů pro aktuální kontext.
     * V rodinném módu vrátí členy rodiny, v osobním pouze přihlášeného uživatele.
     */
    protected function contextUsers(): \Illuminate\Database\Eloquent\Collection
    {
        $familyId = $this->currentFamilyId();

        if ($familyId) {
            $family = \App\Models\Family::find($familyId);
            return $family
                ? $family->members()->select('users.id', 'users.name', 'users.display_name', 'users.avatar_color')->get()
                : collect();
        }

        return \App\Models\User::where('id', auth()->id())
            ->select('id', 'name', 'display_name', 'avatar_color')
            ->get();
    }
}
