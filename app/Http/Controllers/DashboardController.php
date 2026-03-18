<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\RecurringPayment;
use App\Models\Todo;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $currentMonth = now();

        $incomeTotal  = Transaction::income()->currentMonth()->sum('amount');
        $expenseTotal = Transaction::expense()->currentMonth()->sum('amount');
        $balance      = $incomeTotal - $expenseTotal;

        $recentTransactions = Transaction::with(['category', 'user'])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $upcomingRecurring = RecurringPayment::with('category')
            ->where('is_active', true)
            ->where('next_due_date', '<=', now()->addDays(30))
            ->orderBy('next_due_date')
            ->limit(5)
            ->get();

        $pendingTodos = Todo::with('assignedUser')
            ->where('is_completed', false)
            ->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        $chartData = collect(range(5, 0))->map(function (int $i) {
            $month = now()->subMonths($i);
            return [
                'month'   => $month->format('M Y'),
                'income'  => (float) Transaction::income()
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('amount'),
                'expense' => (float) Transaction::expense()
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
            'chartData'          => $chartData,
            'currency'           => config('app.currency', 'PLN'),
        ]);
    }
}
