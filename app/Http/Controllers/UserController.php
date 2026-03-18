<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::orderBy('role')->orderBy('name')->get()->map(fn(User $u) => [
            'id'           => $u->id,
            'name'         => $u->name,
            'display_name' => $u->display_name,
            'email'        => $u->email,
            'avatar_color' => $u->avatar_color,
            'locale'       => $u->locale ?? 'en',
            'role'         => $u->role,
            'is_admin'     => $u->isAdmin(),
        ]);

        return Inertia::render('Users/Index', compact('users'));
    }

    public function create(): Response
    {
        return Inertia::render('Users/Form');
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            'name'         => $request->name,
            'display_name' => $request->display_name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'avatar_color' => $request->avatar_color ?? '#0d6efd',
            'locale'       => $request->locale ?? 'en',
            'role'         => 'member',
        ]);

        return redirect()->route('users.index')
            ->with('success', __('user_created'));
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Form', [
            'editUser' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'display_name' => $user->display_name,
                'email'        => $user->email,
                'avatar_color' => $user->avatar_color,
                'locale'       => $user->locale ?? 'en',
                'role'         => $user->role,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = [
            'name'         => $request->name,
            'display_name' => $request->display_name,
            'email'        => $request->email,
            'avatar_color' => $request->avatar_color ?? '#0d6efd',
            'locale'       => $request->locale ?? 'en',
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('users.index')
            ->with('success', __('user_updated'));
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', __('cannot_delete_self'));
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', __('user_deleted'));
    }
}
