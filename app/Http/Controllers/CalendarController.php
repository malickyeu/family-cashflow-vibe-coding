<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Http\Traits\ResolvesFamily;

class CalendarController extends Controller
{
    use ResolvesFamily;

    public function index(Request $request): Response
    {
        $start = $request->input('start');
        $end = $request->input('end');

        $currentFamilyId = $this->currentFamilyId();

        $query = CalendarEvent::with(['user', 'family'])
            ->where(function ($q) use ($currentFamilyId) {
                // Always include current user's own personal events
                $q->where(function ($q2) {
                    $q2->where('user_id', auth()->id())
                       ->whereNull('family_id');
                });

                if ($currentFamilyId) {
                    // Family calendar:
                    // 1. All events belonging to this family
                    $q->orWhere('family_id', $currentFamilyId);
                    // 2. Personal events from other family members that are shared
                    $familyMemberIds = \App\Models\Family::find($currentFamilyId)
                        ->members()->pluck('users.id')->toArray();
                    $q->orWhere(function ($q3) use ($familyMemberIds) {
                        $q3->whereIn('user_id', $familyMemberIds)
                           ->whereNull('family_id')
                           ->where('shared_to_family', true);
                    });
                } else {
                    // Personal calendar: show events from ALL families the user belongs to
                    $userFamilyIds = auth()->user()->families()->pluck('families.id')->toArray();
                    if (count($userFamilyIds) > 0) {
                        $q->orWhereIn('family_id', $userFamilyIds);
                    }
                }
            });

        if ($start && $end) {
            $query->whereBetween('start_datetime', [$start, $end]);
        }

        $events = $query->orderBy('start_datetime')
            ->get()
            ->map(function ($event) {
                $attendantUsers = [];
                if ($event->attendants && is_array($event->attendants)) {
                    $attendantUsers = User::whereIn('id', $event->attendants)->get()->map(function ($user) {
                        return ['id' => $user->id, 'name' => $user->name];
                    })->toArray();
                }

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'start' => $event->start_datetime,
                    'end' => $event->end_datetime,
                    'allDay' => $event->all_day,
                    'location' => $event->location,
                    'color' => $event->color ?? '#0d6efd',
                    'user' => [
                        'id' => $event->user->id,
                        'name' => $event->user->name,
                    ],
                    'family' => $event->family ? [
                        'id' => $event->family->id,
                        'name' => $event->family->name,
                    ] : null,
                    'recurrenceType' => $event->recurrence_type ?? 'none',
                    'isRecurring' => $event->is_recurring,
                    'sharedToFamily' => $event->shared_to_family,
                    'attendants' => $attendantUsers,
                ];
            });

        // Family members for attendants selector (from currently active family)
        $familyMembers = [];
        if ($this->currentFamilyId()) {
            $family = \App\Models\Family::with('members')->find($this->currentFamilyId());
            if ($family) {
                $familyMembers = $family->members->map(function ($user) {
                    return ['id' => $user->id, 'name' => $user->name];
                })->toArray();
            }
        }

        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'currentDate' => now()->toDateString(),
            'familyMembers' => $familyMembers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'recurrence_type' => 'nullable|in:none,daily,weekly,monthly,yearly',
            'recurrence_interval' => 'nullable|integer|min:1',
            'recurrence_end_date' => 'nullable|date',
            'reminder_minutes' => 'nullable|integer|min:0',
            'shared_to_family' => 'boolean',
            'attendants' => 'nullable|array',
            'attendants.*' => 'integer|exists:users,id',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['family_id'] = $this->currentFamilyId();
        $validated['is_recurring'] = $validated['recurrence_type'] !== 'none';

        CalendarEvent::create($validated);

        return back()->with('success', 'Událost byla vytvořena.');
    }

    public function update(Request $request, CalendarEvent $event): RedirectResponse
    {
        if ($event->user_id !== auth()->id() &&
            ($event->family_id === null || !in_array($event->family_id, auth()->user()->families()->pluck('families.id')->toArray()))) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'all_day' => 'boolean',
            'location' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'reminder_minutes' => 'nullable|integer|min:0',
            'shared_to_family' => 'boolean',
            'attendants' => 'nullable|array',
            'attendants.*' => 'integer|exists:users,id',
        ]);

        $event->update($validated);

        return back()->with('success', 'Událost byla aktualizována.');
    }

    public function move(Request $request, CalendarEvent $event): RedirectResponse
    {
        if ($event->user_id !== auth()->id() &&
            ($event->family_id === null || !in_array($event->family_id, auth()->user()->families()->pluck('families.id')->toArray()))) {
            abort(403);
        }

        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
        ]);

        $event->update($validated);

        return back()->with('success', 'Událost byla přesunuta.');
    }

    public function destroy(CalendarEvent $event): RedirectResponse
    {
        if ($event->user_id !== auth()->id() &&
            ($event->family_id === null || !in_array($event->family_id, auth()->user()->families()->pluck('families.id')->toArray()))) {
            abort(403);
        }

        $event->delete();

        return back()->with('success', 'Událost byla smazána.');
    }
}
