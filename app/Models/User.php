<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'display_name',
        'avatar_color',
        'email',
        'password',
        'locale',
        'role',
        'current_family_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function recurringPayments(): HasMany
    {
        return $this->hasMany(RecurringPayment::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class, 'assigned_to');
    }

    public function createdTodos(): HasMany
    {
        return $this->hasMany(Todo::class, 'created_by');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function shoppingLists(): HasMany
    {
        return $this->hasMany(ShoppingList::class, 'created_by');
    }

    public function families(): BelongsToMany
    {
        return $this->belongsToMany(Family::class, 'family_user')
            ->withPivot('role', 'joined_at');
    }

    public function ownedFamilies(): HasMany
    {
        return $this->hasMany(Family::class, 'created_by');
    }

    public function currentFamily(): BelongsTo
    {
        return $this->belongsTo(Family::class, 'current_family_id');
    }

    public function switchFamily(?int $familyId): void
    {
        $this->update(['current_family_id' => $familyId]);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getDisplayNameAttribute(?string $value): string
    {
        return $value ?? $this->attributes['name'];
    }
}
