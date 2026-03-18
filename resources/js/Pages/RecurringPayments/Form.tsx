import { FormEventHandler } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, RecurringPayment } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    payment?: RecurringPayment;
    categories: Category[];
    currency: string;
}

export default function RecurringForm({ payment, categories, currency }: Props) {
    const t = useTrans();
    const isEditing = !!payment;
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors } = useForm({
        name:                 payment?.name                 ?? '',
        amount:               payment ? String(parseFloat(payment.amount).toFixed(2)) : '',
        frequency:            payment?.frequency            ?? 'monthly' as 'monthly' | 'yearly',
        next_due_date:        payment?.next_due_date        ?? today,
        category_id:          String(payment?.category_id  ?? ''),
        notes:                payment?.notes                ?? '',
        is_active:            payment?.is_active            ?? true,
        send_reminder:        payment?.send_reminder        ?? true,
        reminder_days_before: String(payment?.reminder_days_before ?? 3),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('recurring.update', payment!.id));
        } else {
            post(route('recurring.store'));
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? t('edit_recurring') : t('new_recurring')} />

            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center gap-2">
                                <Link href={route('recurring.index')} className="btn btn-sm btn-light">
                                    <i className="bi bi-arrow-left" />
                                </Link>
                                <h5 className="mb-0 fw-semibold">
                                    {isEditing ? t('edit_recurring') : t('new_recurring')}
                                </h5>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={submit} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label fw-semibold">{t('name')}</label>
                                    <input id="name" type="text"
                                        className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                        value={data.name} onChange={(e) => setData('name', e.target.value)}
                                        required />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="amount" className="form-label fw-semibold">{t('amount')} ({currency})</label>
                                        <input id="amount" type="number" step="0.01" min="0.01"
                                            className={`form-control${errors.amount ? ' is-invalid' : ''}`}
                                            value={data.amount} onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="0.00" required />
                                        {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="frequency" className="form-label fw-semibold">{t('frequency')}</label>
                                        <select id="frequency" className="form-select"
                                            value={data.frequency}
                                            onChange={(e) => setData('frequency', e.target.value as 'monthly' | 'yearly')}>
                                            <option value="monthly">{t('monthly')}</option>
                                            <option value="yearly">{t('yearly')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="next_due_date" className="form-label fw-semibold">{t('next_due')}</label>
                                    <input id="next_due_date" type="date"
                                        className={`form-control${errors.next_due_date ? ' is-invalid' : ''}`}
                                        value={data.next_due_date}
                                        onChange={(e) => setData('next_due_date', e.target.value)} required />
                                    {errors.next_due_date && <div className="invalid-feedback">{errors.next_due_date}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="category_id" className="form-label fw-semibold">{t('category')}</label>
                                    <select id="category_id" className="form-select"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}>
                                        <option value="">{t('no_category')}</option>
                                        {categories.filter((c) => c.type === 'both' || c.type === 'expense').map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="notes" className="form-label fw-semibold">
                                        {t('notes')} <span className="text-muted fw-normal">({t('optional')})</span>
                                    </label>
                                    <textarea id="notes" className="form-control" rows={2}
                                        value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                </div>

                                {/* Reminder settings */}
                                <div className="card bg-light border-0 p-3 mb-4">
                                    <div className="form-check form-switch mb-2">
                                        <input className="form-check-input" type="checkbox" id="send_reminder"
                                            checked={data.send_reminder}
                                            onChange={(e) => setData('send_reminder', e.target.checked)} />
                                        <label className="form-check-label fw-semibold" htmlFor="send_reminder">
                                            {t('send_reminder')}
                                        </label>
                                    </div>
                                    {data.send_reminder && (
                                        <div className="d-flex align-items-center gap-2">
                                            <small className="text-muted">{t('remind')}</small>
                                            <input type="number" min="0" max="30"
                                                className="form-control form-control-sm" style={{ width: 70 }}
                                                value={data.reminder_days_before}
                                                onChange={(e) => setData('reminder_days_before', e.target.value)} />
                                            <small className="text-muted">{t('days_before_due')}</small>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary px-4" disabled={processing}>
                                        {processing ? t('saving') : (isEditing ? t('save') : t('new_recurring'))}
                                    </button>
                                    <Link href={route('recurring.index')} className="btn btn-outline-secondary">
                                        {t('cancel')}
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
