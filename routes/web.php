<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RecurringPaymentController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\ShoppingListItemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

Route::middleware(['auth'])->group(function () {
    Route::post('/locale', [LocaleController::class, 'store'])->name('locale.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Transactions
    Route::resource('transactions', TransactionController::class);

    // Categories
    Route::resource('categories', CategoryController::class)->except(['show']);

    // Recurring payments
    Route::resource('recurring', RecurringPaymentController::class)
         ->parameters(['recurring' => 'recurring']);

    // Todos
    Route::resource('todos', TodoController::class)->except(['show', 'create', 'edit']);
    Route::patch('todos/{todo}/toggle', [TodoController::class, 'toggle'])->name('todos.toggle');

    // Shopping lists
    Route::resource('shopping', ShoppingListController::class);
    Route::post('shopping/{shopping}/archive', [ShoppingListController::class, 'archive'])->name('shopping.archive');
    Route::delete('shopping/{shopping}/clear-checked', [ShoppingListController::class, 'clearChecked'])->name('shopping.clear-checked');

    // Shopping list items (nested)
    Route::post('shopping/{shopping}/items', [ShoppingListItemController::class, 'store'])->name('shopping.items.store');
    Route::patch('shopping/{shopping}/items/{item}', [ShoppingListItemController::class, 'update'])->name('shopping.items.update');
    Route::delete('shopping/{shopping}/items/{item}', [ShoppingListItemController::class, 'destroy'])->name('shopping.items.destroy');

    // User management (admin only)
    Route::resource('users', UserController::class)->middleware('admin');
});

require __DIR__.'/auth.php';
