import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Transaction, RecurringPayment, Todo } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Stats {
    balance: number;
    incomeTotal: number;
    expenseTotal: number;
    currentMonth: string;
}

interface ChartPoint {
    month: string;
    income: number;
    expense: number;
}

interface Props {
    stats: Stats;
    recentTransactions: Transaction[];
    upcomingRecurring: RecurringPayment[];
    pendingTodos: Todo[];
    chartData: ChartPoint[];
    currency: string;
}

function fmt(amount: number, currency: string) {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(amount);
}

const priorityBadge = (p: string) =>
    p === 'high' ? 'bg-danger' : p === 'medium' ? 'bg-warning text-dark' : 'bg-secondary';

export default function DashboardIndex({
    stats, recentTransactions, upcomingRecurring, pendingTodos, chartData, currency,
}: Props) {
    const t = useTrans();
    const maxChart = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

    return (
        <AppLayout>
            <Head title={t('dashboard')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold">{t('dashboard')}</h4>
                    <small className="text-muted">{stats.currentMonth}</small>
                </div>
                <Link href={route('transactions.create')} className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" /> {t('add_transaction')}
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className={`card border-0 shadow-sm text-white ${stats.balance >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-1 opacity-75 small fw-semibold text-uppercase">{t('net_balance')}</p>
                                    <h3 className="mb-0 fw-bold">{fmt(stats.balance, currency)}</h3>
                                </div>
                                <i className="bi bi-wallet2 fs-1 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-1 opacity-75 small fw-semibold text-uppercase">{t('income')}</p>
                                    <h3 className="mb-0 fw-bold">{fmt(stats.incomeTotal, currency)}</h3>
                                </div>
                                <i className="bi bi-arrow-down-left-circle fs-1 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm bg-warning text-dark">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="mb-1 opacity-75 small fw-semibold text-uppercase">{t('expenses')}</p>
                                    <h3 className="mb-0 fw-bold">{fmt(stats.expenseTotal, currency)}</h3>
                                </div>
                                <i className="bi bi-arrow-up-right-circle fs-1 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <span className="fw-semibold">{t('last_6_months')}</span>
                    <div className="d-flex gap-3 small">
                        <span><span className="badge bg-primary me-1">&nbsp;</span>{t('income')}</span>
                        <span><span className="badge bg-danger me-1">&nbsp;</span>{t('expense')}</span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="d-flex align-items-end gap-2" style={{ height: 120 }}>
                        {chartData.map((d) => (
                            <div key={d.month} className="flex-grow-1 d-flex flex-column align-items-center gap-1">
                                <div className="d-flex gap-1 align-items-end w-100 justify-content-center">
                                    <div className="bg-primary rounded-top"
                                        style={{ width: '40%', height: `${(d.income / maxChart) * 100}px`, minHeight: 2 }}
                                        title={`${t('income')}: ${fmt(d.income, currency)}`} />
                                    <div className="bg-danger rounded-top"
                                        style={{ width: '40%', height: `${(d.expense / maxChart) * 100}px`, minHeight: 2 }}
                                        title={`${t('expense')}: ${fmt(d.expense, currency)}`} />
                                </div>
                                <small className="text-muted" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{d.month}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-3">
                {/* Recent Transactions */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <span className="fw-semibold">{t('recent_transactions')}</span>
                            <Link href={route('transactions.index')} className="btn btn-sm btn-outline-primary">
                                {t('view_all')}
                            </Link>
                        </div>
                        <ul className="list-group list-group-flush">
                            {recentTransactions.map((tx) => (
                                <li key={tx.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                            style={{ width: 38, height: 38, backgroundColor: tx.category?.color ?? '#6c757d', flexShrink: 0 }}>
                                            <i className={`bi ${tx.category?.icon ?? 'bi-three-dots'}`} />
                                        </div>
                                        <div>
                                            <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                                                {tx.description || tx.category?.name || '—'}
                                                {tx.is_auto_generated && (
                                                    <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.65rem' }}>{t('auto')}</span>
                                                )}
                                            </div>
                                            <small className="text-muted">{tx.date} · {tx.user.display_name ?? tx.user.name}</small>
                                        </div>
                                    </div>
                                    <span className={`fw-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{fmt(parseFloat(tx.amount), currency)}
                                    </span>
                                </li>
                            ))}
                            {recentTransactions.length === 0 && (
                                <li className="list-group-item text-center text-muted py-4">
                                    <i className="bi bi-inbox fs-3 d-block mb-2 opacity-50" />
                                    {t('no_transactions')}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Upcoming Recurring */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                            <span className="fw-semibold">{t('upcoming_payments')}</span>
                            <Link href={route('recurring.index')} className="btn btn-sm btn-outline-primary">
                                {t('view_all')}
                            </Link>
                        </div>
                        <ul className="list-group list-group-flush">
                            {upcomingRecurring.map((p) => (
                                <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                    <div>
                                        <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{p.name}</div>
                                        <small className="text-muted">
                                            {t('next_due')} {p.next_due_date} · {p.frequency}
                                        </small>
                                    </div>
                                    <span className="badge bg-warning text-dark fs-6 px-2 py-1">
                                        {fmt(parseFloat(p.amount), currency)}
                                    </span>
                                </li>
                            ))}
                            {upcomingRecurring.length === 0 && (
                                <li className="list-group-item text-center text-muted py-4">
                                    <i className="bi bi-calendar-check fs-3 d-block mb-2 opacity-50" />
                                    {t('no_upcoming_payments')}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Pending Todos */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <span className="fw-semibold">{t('pending_todos')}</span>
                    <Link href={route('todos.index')} className="btn btn-sm btn-outline-primary">{t('view_all')}</Link>
                </div>
                <ul className="list-group list-group-flush">
                    {pendingTodos.map((todo) => (
                        <li key={todo.id} className="list-group-item d-flex align-items-center gap-3 py-3">
                            <span className={`badge ${priorityBadge(todo.priority)}`}>{t(todo.priority)}</span>
                            <div className="flex-grow-1">
                                <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>{todo.title}</span>
                                {todo.due_date && (
                                    <small className={`ms-2 ${todo.due_date < new Date().toISOString().split('T')[0] ? 'text-danger' : 'text-muted'}`}>
                                        <i className="bi bi-calendar3 me-1" />{todo.due_date}
                                    </small>
                                )}
                            </div>
                            {todo.assigned_user && (
                                <small className="text-muted">
                                    <i className="bi bi-person me-1" />
                                    {todo.assigned_user.display_name ?? todo.assigned_user.name}
                                </small>
                            )}
                        </li>
                    ))}
                    {pendingTodos.length === 0 && (
                        <li className="list-group-item text-center text-muted py-4">
                            <i className="bi bi-check2-all fs-3 d-block mb-2 text-success opacity-75" />
                            {t('no_pending_todos')}
                        </li>
                    )}
                </ul>
            </div>
        </AppLayout>
    );
}
