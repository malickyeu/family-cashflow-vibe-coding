import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Transaction, Category, User, PaginatedData } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface Summary { income: number; expense: number; balance: number; }
interface Filters { month?: string; category_id?: string; type?: string; user_id?: string; }

interface Props {
    transactions: PaginatedData<Transaction>;
    summary: Summary;
    categories: Category[];
    users: User[];
    filters: Filters;
    currency: string;
}

export default function TransactionsIndex({
    transactions, summary, categories, users, filters, currency,
}: Props) {
    const t = useTrans();

    function applyFilter(key: string, value: string) {
        router.get(route('transactions.index'), { ...filters, [key]: value || undefined }, {
            preserveState: true, replace: true,
        });
    }

    function clearFilters() {
        router.get(route('transactions.index'));
    }

    const today = new Date().toISOString().slice(0, 7);

    return (
        <AppLayout>
            <Head title={t('transactions')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{t('transactions')}</h4>
                <Link href={route('transactions.create')} className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" /> {t('add_transaction')}
                </Link>
            </div>

            {/* Summary Bar */}
            <div className="row g-2 mb-3">
                {[
                    { key: 'income',  label: t('income'),   val: summary.income,  cls: 'bg-success bg-opacity-10 text-success border-success' },
                    { key: 'expense', label: t('expenses'),  val: summary.expense, cls: 'bg-danger bg-opacity-10 text-danger border-danger' },
                    { key: 'balance', label: t('balance'),   val: summary.balance, cls: summary.balance >= 0 ? 'bg-primary bg-opacity-10 text-primary border-primary' : 'bg-danger bg-opacity-10 text-danger border-danger' },
                ].map(({ key, label, val, cls }) => (
                    <div key={key} className="col-md-4">
                        <div className={`card border text-center py-2 px-3 ${cls}`}>
                            <small className="text-uppercase fw-semibold opacity-75">{label}</small>
                            <strong className="fs-5">{formatCurrency(val, currency)}</strong>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body py-2">
                    <div className="row g-2 align-items-end">
                        <div className="col-auto">
                            <label className="form-label form-label-sm mb-1">{t('month')}</label>
                            <input type="month" className="form-control form-control-sm"
                                value={filters.month ?? today}
                                onChange={(e) => applyFilter('month', e.target.value)} />
                        </div>
                        <div className="col-auto">
                            <label className="form-label form-label-sm mb-1">{t('type')}</label>
                            <select className="form-select form-select-sm"
                                value={filters.type ?? ''}
                                onChange={(e) => applyFilter('type', e.target.value)}>
                                <option value="">{t('all_types')}</option>
                                <option value="income">{t('income')}</option>
                                <option value="expense">{t('expense')}</option>
                            </select>
                        </div>
                        <div className="col-auto">
                            <label className="form-label form-label-sm mb-1">{t('category')}</label>
                            <select className="form-select form-select-sm"
                                value={filters.category_id ?? ''}
                                onChange={(e) => applyFilter('category_id', e.target.value)}>
                                <option value="">{t('all_categories')}</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-auto">
                            <label className="form-label form-label-sm mb-1">{t('member')}</label>
                            <select className="form-select form-select-sm"
                                value={filters.user_id ?? ''}
                                onChange={(e) => applyFilter('user_id', e.target.value)}>
                                <option value="">{t('all_members')}</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.display_name ?? u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-auto">
                            <button className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
                                <i className="bi bi-x-circle me-1" />{t('clear')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>{t('date')}</th>
                                <th>{t('description')}</th>
                                <th>{t('category')}</th>
                                <th>{t('member')}</th>
                                <th>{t('type')}</th>
                                <th className="text-end">{t('amount')}</th>
                                <th style={{ width: 80 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.map((tx) => (
                                <tr key={tx.id}>
                                    <td><small className="text-muted">{formatDate(tx.date)}</small></td>
                                    <td>
                                        <span style={{ fontSize: '0.9rem' }}>
                                            {tx.description || <span className="text-muted">—</span>}
                                        </span>
                                        {tx.is_auto_generated && (
                                            <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.65rem' }}>{t('auto')}</span>
                                        )}
                                    </td>
                                    <td>
                                        {tx.category ? (
                                            <span className="badge d-inline-flex align-items-center gap-1"
                                                style={{ backgroundColor: tx.category.color }}>
                                                {tx.category.icon && <i className={`bi ${tx.category.icon}`} />}
                                                {tx.category.name}
                                            </span>
                                        ) : <span className="text-muted small">—</span>}
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                                style={{ width: 24, height: 24, backgroundColor: tx.user.avatar_color ?? '#0d6efd', fontSize: 11, flexShrink: 0 }}>
                                                {tx.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <small>{tx.user.display_name ?? tx.user.name}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${tx.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                                            {tx.type === 'income' ? t('income') : t('expense')}
                                        </span>
                                    </td>
                                    <td className={`text-end fw-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1 justify-content-end">
                                            <Link href={route('transactions.edit', tx.id)} className="btn btn-sm btn-light">
                                                <i className="bi bi-pencil" />
                                            </Link>
                                            <Link href={route('transactions.destroy', tx.id)} method="delete" as="button"
                                                className="btn btn-sm btn-light text-danger"
                                                onClick={(e) => { if (!confirm(t('delete_transaction_confirm'))) e.preventDefault(); }}>
                                                <i className="bi bi-trash" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-5">
                                        <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50" />
                                        {t('no_transactions_found')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            {t('showing')} {transactions.from}–{transactions.to} {t('of')} {transactions.total}
                        </small>
                        <div className="d-flex gap-1">
                            {transactions.links.map((link, i) => (
                                <button key={i}
                                    className={`btn btn-sm ${link.active ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
