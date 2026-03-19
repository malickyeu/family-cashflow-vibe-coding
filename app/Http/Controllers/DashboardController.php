<?php

namespace App\Http\Controllers;

use App\Http\Traits\ResolvesFamily;
use App\Models\Transaction;
use App\Models\RecurringPayment;
use App\Models\Todo;
use App\Models\ShoppingList;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ResolvesFamily;

    public function index(): Response
    {
        $currentMonth = now();

        $incomeTotal  = $this->applyScope(Transaction::income()->currentMonth())->sum('amount');
        $expenseTotal = $this->applyScope(Transaction::expense()->currentMonth())->sum('amount');
        $balance      = $incomeTotal - $expenseTotal;

        $recentTransactions = $this->applyScope(Transaction::with(['category', 'user']))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $upcomingRecurring = $this->applyScope(RecurringPayment::with('category'), 'user_id')
            ->where('is_active', true)
            ->where('next_due_date', '<=', now()->addDays(30))
            ->orderBy('next_due_date')
            ->limit(5)
            ->get();

        $pendingTodos = $this->applyScope(Todo::with('assignedUser'), 'created_by')
            ->where('is_completed', false)
            ->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        // Shopping lists
        $shoppingLists = $this->applyScope(ShoppingList::with(['items', 'creator']), 'created_by')
            ->where('is_archived', false)
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn ($list) => [
                'id'            => $list->id,
                'name'          => $list->name,
                'progress'      => $list->progress,
                'item_count'    => $list->items->count(),
                'checked_count' => $list->items->where('is_checked', true)->count(),
                'total_price'   => (float) $list->items->sum(fn($item) => ($item->price ?? 0) * $item->quantity),
                'paid_price'    => (float) $list->items->where('is_checked', true)->sum(fn($item) => ($item->price ?? 0) * $item->quantity),
                'creator'       => $list->creator,
            ]);

        $incompleteLists = $shoppingLists->filter(fn($list) => $list['progress'] < 100)->take(4)->values();
        $completeLists = $shoppingLists->filter(fn($list) => $list['progress'] === 100)->take(4)->values();

        $chartData = collect(range(5, 0))->map(function (int $i) {
            $month = now()->subMonths($i);
            return [
                'month'   => $month->format('M Y'),
                'income'  => (float) $this->applyScope(Transaction::income())
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('amount'),
                'expense' => (float) $this->applyScope(Transaction::expense())
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('amount'),
            ];
        });

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'balance'      => (float) $balance,
                'incomeTotal'  => (float) $incomeTotal,
                'expenseTotal' => (float) $expenseTotal,
                'currentMonth' => $currentMonth->format('F Y'),
            ],
            'recentTransactions' => $recentTransactions,
            'upcomingRecurring'  => $upcomingRecurring,
            'pendingTodos'       => $pendingTodos,
            'incompleteLists'    => $incompleteLists,
            'completeLists'      => $completeLists,
            'chartData'          => $chartData,
            'currency'           => config('app.currency', 'PLN'),
        ]);
    }
}
