<?php

namespace App\Policies;

use App\Models\Family;
use App\Models\User;

class FamilyPolicy
{
    /**
     * Člen nebo owner může zobrazit rodinu.
     */
    public function view(User $user, Family $family): bool
    {
        return $family->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Pouze owner může spravovat členy.
     */
    public function manage(User $user, Family $family): bool
    {
        return $family->created_by === $user->id;
    }

    /**
     * Pouze owner může smazat rodinu.
     */
    public function delete(User $user, Family $family): bool
    {
        return $family->created_by === $user->id;
    }
}
