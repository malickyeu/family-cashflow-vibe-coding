import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { RecurringPayment } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';
import { formatCurrency, formatDate, getDaysUntil } from '@/utils/formatters';

interface Props {
    payments: RecurringPayment[];
    currency: string;
}

export default function RecurringIndex({ payments, currency }: Props) {
    const t = useTrans();
    const active   = payments.filter((p) => p.is_active);
    const inactive = payments.filter((p) => !p.is_active);

    function toggle(payment: RecurringPayment) {
        router.patch(route('recurring.update', payment.id), { is_active: !payment.is_active });
    }

    return (
        <AppLayout>
            <Head title={t('recurring_payments')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{t('recurring_payments')}</h4>
                <Link href={route('recurring.create')} className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" /> {t('add_recurring')}
                </Link>
            </div>

            {/* Active */}
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white border-bottom py-3">
                    <span className="fw-semibold">{t('active')} <span className="badge bg-success ms-1">{active.length}</span></span>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>{t('name')}</th>
                                <th>{t('amount')}</th>
                                <th>{t('frequency')}</th>
                                <th>{t('next_due')}</th>
                                <th>{t('category')}</th>
                                <th style={{ width: 120 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {active.map((p) => {
                                const daysLeft = getDaysUntil(p.next_due_date);
                                return (
                                    <tr key={p.id}>
                                        <td className="fw-semibold">{p.name}</td>
                                        <td className="text-danger fw-semibold">{formatCurrency(p.amount, currency)}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                <i className={`bi ${p.frequency === 'monthly' ? 'bi-calendar-month' : 'bi-calendar-year'} me-1`} />
                                                {p.frequency === 'monthly' ? t('monthly') : t('yearly')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={
                                                daysLeft <= 0 ? 'text-danger fw-semibold' :
                                                daysLeft <= 3 ? 'text-warning fw-semibold' : 'text-muted'
                                            }>
                                                {formatDate(p.next_due_date)}
                                                {daysLeft <= 3 && daysLeft > 0 && (
                                                    <span className="badge bg-warning text-dark ms-1">{daysLeft}d</span>
                                                )}
                                                {daysLeft <= 0 && (
                                                    <span className="badge bg-danger ms-1">{t('overdue_badge')}</span>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            {p.category ? (
                                                <span className="badge" style={{ backgroundColor: p.category.color }}>
                                                    {p.category.name}
                                                </span>
                                            ) : <span className="text-muted small">—</span>}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <Link href={route('recurring.edit', p.id)} className="btn btn-sm btn-light">
                                                    <i className="bi bi-pencil" />
                                                </Link>
                                                <button className="btn btn-sm btn-light text-warning"
                                                    onClick={() => toggle(p)} title={t('deactivate')}>
                                                    <i className="bi bi-pause-circle" />
                                                </button>
                                                <Link href={route('recurring.destroy', p.id)} method="delete" as="button"
                                                    className="btn btn-sm btn-light text-danger"
                                                    onClick={(e) => { if (!confirm(t('delete_recurring_confirm'))) e.preventDefault(); }}>
                                                    <i className="bi bi-trash" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {active.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">
                                        {t('no_recurring')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inactive */}
            {inactive.length > 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom py-3">
                        <span className="fw-semibold text-muted">
                            {t('inactive')} <span className="badge bg-secondary ms-1">{inactive.length}</span>
                        </span>
                    </div>
                    <div className="table-responsive">
                        <table className="table mb-0 align-middle opacity-50">
                            <tbody>
                                {inactive.map((p) => (
                                    <tr key={p.id}>
                                        <td className="fw-semibold">{p.name}</td>
                                        <td>{formatCurrency(p.amount, currency)}</td>
                                        <td>{p.frequency === 'monthly' ? t('monthly') : t('yearly')}</td>
                                        <td>{formatDate(p.next_due_date)}</td>
                                        <td>
                                            <button className="btn btn-sm btn-light text-success"
                                                onClick={() => toggle(p)} title={t('activate')}>
                                                <i className="bi bi-play-circle me-1" /> {t('activate')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
