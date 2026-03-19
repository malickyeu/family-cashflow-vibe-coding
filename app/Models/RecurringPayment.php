<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringPayment extends Model
{
    protected $fillable = [
        'name',
        'amount',
        'frequency',
        'next_due_date',
        'category_id',
        'user_id',
        'notes',
        'is_active',
        'send_reminder',
        'reminder_days_before',
        'family_id',
    ];

    protected $casts = [
        'next_due_date' => 'date',
        'amount' => 'decimal:2',
        'is_active' => 'boolean',
        'send_reminder' => 'boolean',
        'reminder_days_before' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function advanceDueDate(): void
    {
        $this->next_due_date = match ($this->frequency) {
            'monthly' => $this->next_due_date->addMonth(),
            'yearly'  => $this->next_due_date->addYear(),
        };
        $this->save();
    }
}
