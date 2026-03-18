<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use App\Models\User;
use App\Http\Requests\StoreTodoRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TodoController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Todo::with(['assignedUser', 'creator']);

        if ($request->filled('status')) {
            $query->where('is_completed', $request->status === 'completed');
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $query->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
              ->orderBy('due_date')
              ->orderByDesc('created_at');

        return Inertia::render('Todos/Index', [
            'todos'   => $query->get(),
            'users'   => User::select('id', 'name', 'display_name', 'avatar_color')->orderBy('name')->get(),
            'filters' => $request->only(['status', 'priority', 'assigned_to']),
        ]);
    }

    public function store(StoreTodoRequest $request): RedirectResponse
    {
        Todo::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Todo created.');
    }

    public function update(StoreTodoRequest $request, Todo $todo): RedirectResponse
    {
        $data = $request->validated();

        if (isset($data['is_completed']) && $data['is_completed'] && ! $todo->is_completed) {
            $data['completed_at'] = now();
        } elseif (isset($data['is_completed']) && ! $data['is_completed']) {
            $data['completed_at'] = null;
        }

        $todo->update($data);

        return back()->with('success', 'Todo updated.');
    }

    public function destroy(Todo $todo): RedirectResponse
    {
        $todo->delete();

        return back()->with('success', 'Todo deleted.');
    }

    public function toggle(Todo $todo): RedirectResponse
    {
        $todo->is_completed = ! $todo->is_completed;
        $todo->completed_at = $todo->is_completed ? now() : null;
        $todo->save();

        return back();
    }
}
