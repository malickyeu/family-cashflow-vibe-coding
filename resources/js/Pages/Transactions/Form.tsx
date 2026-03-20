import { FormEventHandler } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, User, Transaction } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    transaction?: Transaction;
    categories: Category[];
    users: User[];
    currency: string;
}

export default function TransactionForm({ transaction, categories, users, currency }: Props) {
    const t = useTrans();
    const isEditing = !!transaction;
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors } = useForm({
        type:        transaction?.type        ?? 'expense' as 'income' | 'expense',
        amount:      transaction ? parseFloat(transaction.amount).toFixed(2) : '',
        category_id: String(transaction?.category_id ?? ''),
        date:        transaction?.date        ?? today,
        description: transaction?.description ?? '',
        user_id:     String(transaction?.user_id ?? ''),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('transactions.update', transaction!.id));
        } else {
            post(route('transactions.store'));
        }
    };

    const filteredCategories = categories.filter(
        (c) => c.type === 'both' || c.type === data.type
    );

    return (
        <AppLayout>
            <Head title={isEditing ? t('edit_transaction') : t('new_transaction')} />

            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center gap-2">
                                <Link href={route('transactions.index')} className="btn btn-sm btn-light">
                                    <i className="bi bi-arrow-left" />
                                </Link>
                                <h5 className="mb-0 fw-semibold">
                                    {isEditing ? t('edit_transaction') : t('new_transaction')}
                                </h5>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={submit} noValidate>
                                {/* Type Toggle */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">{t('transaction_type')}</label>
                                    <div className="btn-group w-100" role="group">
                                        {(['expense', 'income'] as const).map((tp) => (
                                            <button key={tp} type="button"
                                                className={`btn ${data.type === tp
                                                    ? (tp === 'income' ? 'btn-success' : 'btn-danger')
                                                    : 'btn-outline-secondary'}`}
                                                onClick={() => setData('type', tp)}>
                                                <i className={`bi ${tp === 'income' ? 'bi-arrow-down-left' : 'bi-arrow-up-right'} me-1`} />
                                                {tp === 'income' ? t('income') : t('expense')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="mb-3">
                                    <label htmlFor="amount" className="form-label fw-semibold">
                                        {t('amount')} ({currency})
                                    </label>
                                    <input id="amount" type="number" step="0.01" min="0.01"
                                        className={`form-control form-control-lg${errors.amount ? ' is-invalid' : ''}`}
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0.00" required />
                                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                                </div>

                                {/* Category */}
                                <div className="mb-3">
                                    <label htmlFor="category_id" className="form-label fw-semibold">{t('category')}</label>
                                    <select id="category_id" className="form-select"
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}>
                                        <option value="">{t('no_category')}</option>
                                        {filteredCategories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div className="mb-3">
                                    <label htmlFor="date" className="form-label fw-semibold">{t('date')}</label>
                                    <input id="date" type="date"
                                        className={`form-control${errors.date ? ' is-invalid' : ''}`}
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)} required />
                                    {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                                </div>

                                {/* Who paid */}
                                <div className="mb-3">
                                    <label htmlFor="user_id" className="form-label fw-semibold">
                                        {data.type === 'income' ? t('received_by') : t('paid_by')}
                                    </label>
                                    <select id="user_id"
                                        className={`form-select${errors.user_id ? ' is-invalid' : ''}`}
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)} required>
                                        <option value="">{t('select_member')}</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.display_name ?? u.name}</option>
                                        ))}
                                    </select>
                                    {errors.user_id && <div className="invalid-feedback">{errors.user_id}</div>}
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label htmlFor="description" className="form-label fw-semibold">
                                        {t('description')} <span className="text-muted fw-normal">({t('optional')})</span>
                                    </label>
                                    <input id="description" type="text" className="form-control"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)} />
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary px-4" disabled={processing}>
                                        {processing ? t('saving') : (isEditing ? t('update_transaction') : t('add_transaction'))}
                                    </button>
                                    <Link href={route('transactions.index')} className="btn btn-outline-secondary">
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
