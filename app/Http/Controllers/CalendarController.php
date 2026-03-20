<?php
namespace App\Http\Controllers;
use App\Models\CalendarEvent;
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
        $query = CalendarEvent::with(['user', 'family'])
            ->where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->where('family_id', null);
                if ($this->currentFamilyId()) {
                    $q->orWhere('family_id', $this->currentFamilyId());
                }
            });
        if ($start && $end) {
            $query->whereBetween('start_datetime', [$start, $end]);
        }
        $events = $query->orderBy('start_datetime')
            ->get()
            ->map(function ($event) {
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
                ];
            });
        return Inertia::render('Calendar/Index', [
            'events' => $events,
            'currentDate' => now()->toDateString(),
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
            ($event->family_id === null || $event->family_id !== $this->currentFamilyId())) {
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
        ]);
        $event->update($validated);
        return back()->with('success', 'Událost byla aktualizována.');
    }
    public function move(Request $request, CalendarEvent $event): RedirectResponse
    {
        if ($event->user_id !== auth()->id() && 
            ($event->family_id === null || $event->family_id !== $this->currentFamilyId())) {
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
            ($event->family_id === null || $event->family_id !== $this->currentFamilyId())) {
            abort(403);
        }
        $event->delete();
        return back()->with('success', 'Událost byla smazána.');
    }
}
