<?php

namespace App\Http\Controllers;

use App\Models\Family;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FamilyController extends Controller
{
    public function index(): Response
    {
        $families = auth()->user()
            ->families()
            ->withCount('members')
            ->with('owner')
            ->get()
            ->map(function ($family) {
                return [
                    'id'            => $family->id,
                    'name'          => $family->name,
                    'created_by'    => $family->created_by,
                    'owner'         => $family->owner,
                    'members_count' => $family->members_count,
                    'pivot_role'    => $family->pivot->role,
                ];
            });

        return Inertia::render('Families/Index', [
            'families' => $families,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $family = Family::create([
            'name'       => $validated['name'],
            'created_by' => auth()->id(),
        ]);

        // Přidáme zakladatele jako owner
        $family->members()->attach(auth()->id(), [
            'role'      => 'owner',
            'joined_at' => now(),
        ]);

        // Automaticky přepneme na novou rodinu
        auth()->user()->switchFamily($family->id);

        return redirect()->route('families.show', $family)
            ->with('success', __('family_created'));
    }

    public function show(Family $family): Response
    {
        Gate::authorize('view', $family);

        $family->load(['members', 'owner']);

        $members = $family->members->map(function ($member) {
            return [
                'id'           => $member->id,
                'name'         => $member->name,
                'display_name' => $member->display_name,
                'email'        => $member->email,
                'avatar_color' => $member->avatar_color,
                'role'         => $member->pivot->role,
            ];
        });

        return Inertia::render('Families/Show', [
            'family'  => [
                'id'         => $family->id,
                'name'       => $family->name,
                'created_by' => $family->created_by,
                'owner'      => $family->owner,
            ],
            'members'   => $members,
            'userRole'  => $family->members->firstWhere('id', auth()->id())?->pivot->role ?? 'member',
        ]);
    }

    public function invite(Request $request, Family $family): RedirectResponse
    {
        Gate::authorize('manage', $family);

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return back()->withErrors(['email' => __('user_not_found')]);
        }

        if ($family->members()->where('user_id', $user->id)->exists()) {
            return back()->withErrors(['email' => __('already_member')]);
        }

        $family->members()->attach($user->id, [
            'role'      => 'member',
            'joined_at' => now(),
        ]);

        return back()->with('success', __('member_invited'));
    }

    public function removeMember(Family $family, User $user): RedirectResponse
    {
        Gate::authorize('manage', $family);

        // Owner nemůže sám sebe odebrat přes tuto akci
        if ($user->id === $family->created_by && auth()->id() === $family->created_by) {
            return back()->with('error', __('cannot_remove_owner'));
        }

        $family->members()->detach($user->id);

        // Pokud byl uživatel přepnutý na tuto rodinu, vrátíme ho do osobního módu
        if ($user->current_family_id === $family->id) {
            $user->switchFamily(null);
        }

        return back()->with('success', __('member_removed'));
    }

    public function destroy(Family $family): RedirectResponse
    {
        Gate::authorize('delete', $family);

        // Všechny členy vrátíme do osobního módu
        User::where('current_family_id', $family->id)
            ->update(['current_family_id' => null]);

        $family->delete();

        return redirect()->route('families.index')
            ->with('success', __('family_deleted'));
    }

    public function switchFamily(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'family_id' => 'nullable|integer',
        ]);

        $familyId = $validated['family_id'] ?? null;

        if ($familyId !== null) {
            // Ověříme, že uživatel je členem rodiny
            $isMember = auth()->user()->families()->where('families.id', $familyId)->exists();
            if (! $isMember) {
                return back()->with('error', __('not_family_member'));
            }
        }

        auth()->user()->switchFamily($familyId);

        return redirect()->intended(route('dashboard'));
    }
}
