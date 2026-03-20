<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class CalendarEvent extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'family_id',
        'shared_to_family',
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'all_day',
        'location',
        'color',
        'is_recurring',
        'recurrence_type',
        'recurrence_interval',
        'recurrence_days',
        'recurrence_end_date',
        'parent_event_id',
        'reminder_minutes',
        'attendants',
    ];
    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'all_day' => 'boolean',
        'shared_to_family' => 'boolean',
        'is_recurring' => 'boolean',
        'recurrence_days' => 'array',
        'recurrence_end_date' => 'date',
        'attendants' => 'array',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }
    public function parentEvent(): BelongsTo
    {
        return $this->belongsTo(CalendarEvent::class, 'parent_event_id');
    }
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    public function scopeInDateRange($query, $start, $end)
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->whereBetween('start_datetime', [$start, $end])
              ->orWhereBetween('end_datetime', [$start, $end])
              ->orWhere(function ($q2) use ($start, $end) {
                  $q2->where('start_datetime', '<=', $start)
                     ->where('end_datetime', '>=', $end);
              });
        });
    }
}
