<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;
use App\Http\Requests\StoreTransactionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::with(['category', 'user'])
            ->orderByDesc('date')
            ->orderByDesc('id');

        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $query->whereYear('date', $year)->whereMonth('date', $month);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->paginate(25)->withQueryString();

        $summaryQuery = Transaction::query();
        if ($request->filled('month')) {
            [$year, $month] = explode('-', $request->month);
            $summaryQuery->whereYear('date', $year)->whereMonth('date', $month);
        } else {
            $summaryQuery->currentMonth();
        }
        $income  = (float) (clone $summaryQuery)->income()->sum('amount');
        $expense = (float) (clone $summaryQuery)->expense()->sum('amount');
        $summary = [
            'income'  => $income,
            'expense' => $expense,
            'balance' => $income - $expense,
        ];

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'summary'      => $summary,
            'categories'   => Category::visibleTo(auth()->id())->orderBy('name')->get(),
            'users'        => User::select('id', 'name', 'display_name', 'avatar_color')->orderBy('name')->get(),
            'filters'      => $request->only(['month', 'category_id', 'type', 'user_id']),
            'currency'     => config('app.currency', 'PLN'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Transactions/Form', [
            'categories' => Category::visibleTo(auth()->id())->orderBy('name')->get(),
            'users'      => User::select('id', 'name', 'display_name', 'avatar_color')->orderBy('name')->get(),
            'currency'   => config('app.currency', 'PLN'),
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        Transaction::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction added successfully.');
    }

    public function edit(Transaction $transaction): Response
    {
        return Inertia::render('Transactions/Form', [
            'transaction' => $transaction->load('category'),
            'categories'  => Category::visibleTo(auth()->id())->orderBy('name')->get(),
            'users'       => User::select('id', 'name', 'display_name', 'avatar_color')->orderBy('name')->get(),
            'currency'    => config('app.currency', 'PLN'),
        ]);
    }

    public function update(StoreTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $transaction->update($request->validated());

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction deleted.');
    }
}
