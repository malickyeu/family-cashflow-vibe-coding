<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Transaction extends Model
{
    protected $fillable = [
        'type',
        'amount',
        'category_id',
        'date',
        'description',
        'user_id',
        'created_by',
        'recurring_payment_id',
        'is_auto_generated',
        'family_id',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'is_auto_generated' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function recurringPayment(): BelongsTo
    {
        return $this->belongsTo(RecurringPayment::class);
    }

    public function scopeCurrentMonth(Builder $query): Builder
    {
        return $query->whereYear('date', now()->year)
                     ->whereMonth('date', now()->month);
    }

    public function scopeIncome(Builder $query): Builder
    {
        return $query->where('type', 'income');
    }

    public function scopeExpense(Builder $query): Builder
    {
        return $query->where('type', 'expense');
    }
}
