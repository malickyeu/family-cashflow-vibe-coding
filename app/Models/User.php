<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
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

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getDisplayNameAttribute(?string $value): string
    {
        return $value ?? $this->attributes['name'];
    }
}
