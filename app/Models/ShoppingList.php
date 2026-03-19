<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShoppingList extends Model
{
    protected $fillable = [
        'name',
        'notes',
        'created_by',
        'is_archived',
        'archived_at',
        'family_id',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    protected $appends = ['progress'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ShoppingListItem::class)->orderBy('sort_order')->orderBy('id');
    }

    public function uncheckedItems(): HasMany
    {
        return $this->hasMany(ShoppingListItem::class)
                    ->where('is_checked', false)
                    ->orderBy('sort_order')
                    ->orderBy('id');
    }

    public function getProgressAttribute(): int
    {
        $total = $this->items()->count();
        if ($total === 0) {
            return 0;
        }
        $checked = $this->items()->where('is_checked', true)->count();
        return (int) round(($checked / $total) * 100);
    }
}
