import { FormEventHandler, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    categories: Category[];
}

// Bootstrap Icons suggestions
const iconSuggestions = [
    'bi-wallet2', 'bi-cart', 'bi-house', 'bi-car-front', 'bi-cup-hot', 'bi-gift',
    'bi-heart-pulse', 'bi-phone', 'bi-tv', 'bi-lightning', 'bi-fuel-pump',
    'bi-airplane', 'bi-bag', 'bi-book', 'bi-currency-dollar', 'bi-piggy-bank',
];

export default function CategoriesIndex({ categories }: Props) {
    console.log('CategoriesIndex rendering', { categories });
    const t = useTrans();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        color: '#6c757d',
        icon: '',
        type: 'both' as 'income' | 'expense' | 'both',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        name: '',
        color: '#6c757d',
        icon: '',
        type: 'both' as 'income' | 'expense' | 'both',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setEditData({
            name: category.name,
            color: category.color,
            icon: category.icon || '',
            type: category.type,
        });
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editingId === null) return;
        
        put(route('categories.update', editingId), {
            onSuccess: () => {
                resetEdit();
                setEditingId(null);
            },
        });
    };

    const deleteCategory = (id: number) => {
        if (!confirm(t('delete_category_confirm'))) return;
        router.delete(route('categories.destroy', id));
    };

    const getTypeLabel = (type: string) => {
        if (type === 'income') return t('income');
        if (type === 'expense') return t('expense');
        return t('both');
    };

    const getTypeBadge = (type: string) => {
        if (type === 'income') return 'success';
        if (type === 'expense') return 'danger';
        return 'secondary';
    };

    return (
        <AppLayout>
            <Head title={t('categories')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{t('categories')}</h4>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <i className="bi bi-plus-lg me-1" /> {t('new_category')}
                </button>
            </div>

            {/* Add new category form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-semibold mb-3">{t('new_category')}</h6>
                        <form onSubmit={submit} noValidate>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">{t('name')} *</label>
                                    <input
                                        type="text"
                                        className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('name')}
                                        required
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label fw-semibold">{t('type')} *</label>
                                    <select
                                        className="form-select"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value as any)}
                                    >
                                        <option value="both">{t('both')}</option>
                                        <option value="income">{t('income')}</option>
                                        <option value="expense">{t('expense')}</option>
                                    </select>
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label fw-semibold">{t('color')} *</label>
                                    <input
                                        type="color"
                                        className={`form-control form-control-color${errors.color ? ' is-invalid' : ''}`}
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        required
                                    />
                                    {errors.color && <div className="invalid-feedback">{errors.color}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">{t('icon')} ({t('optional')})</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            {data.icon && <i className={`bi ${data.icon}`} />}
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            placeholder="bi-wallet2"
                                            list="icon-suggestions"
                                        />
                                        <datalist id="icon-suggestions">
                                            {iconSuggestions.map((icon) => (
                                                <option key={icon} value={icon} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <small className="text-muted">Bootstrap Icons class (např. bi-wallet2)</small>
                                </div>
                            </div>

                            <div className="mt-3">
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? t('saving') : t('save')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary ms-2"
                                    onClick={() => {
                                        setShowForm(false);
                                        reset();
                                    }}
                                >
                                    {t('cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories list */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    {categories.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <i className="bi bi-tags fs-1 d-block mb-2 opacity-50" />
                            <p>{t('no_categories')}</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '50px' }}></th>
                                        <th>{t('name')}</th>
                                        <th>{t('type')}</th>
                                        <th>{t('color')}</th>
                                        <th>{t('icon')}</th>
                                        <th style={{ width: '100px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        editingId === category.id ? (
                                            <tr key={category.id}>
                                                <td colSpan={6}>
                                                    <form onSubmit={submitEdit} className="p-2">
                                                        <div className="row g-2">
                                                            <div className="col-md-4">
                                                                <input
                                                                    type="text"
                                                                    className={`form-control form-control-sm${editErrors.name ? ' is-invalid' : ''}`}
                                                                    value={editData.name}
                                                                    onChange={(e) => setEditData('name', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-md-2">
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={editData.type}
                                                                    onChange={(e) => setEditData('type', e.target.value as any)}
                                                                >
                                                                    <option value="both">{t('both')}</option>
                                                                    <option value="income">{t('income')}</option>
                                                                    <option value="expense">{t('expense')}</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-md-2">
                                                                <input
                                                                    type="color"
                                                                    className="form-control form-control-color form-control-sm"
                                                                    value={editData.color}
                                                                    onChange={(e) => setEditData('color', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="col-md-2">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={editData.icon}
                                                                    onChange={(e) => setEditData('icon', e.target.value)}
                                                                    placeholder="bi-..."
                                                                />
                                                            </div>
                                                            <div className="col-md-2">
                                                                <button type="submit" className="btn btn-sm btn-success me-1" disabled={editProcessing}>
                                                                    <i className="bi bi-check-lg" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => {
                                                                        setEditingId(null);
                                                                        resetEdit();
                                                                    }}
                                                                >
                                                                    <i className="bi bi-x-lg" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={category.id}>
                                                <td>
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            backgroundColor: category.color,
                                                        }}
                                                    >
                                                        {category.icon && <i className={`bi ${category.icon}`} />}
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>{category.name}</strong>
                                                    {category.is_predefined && (
                                                        <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                                                            Predefined
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${getTypeBadge(category.type)}`}>
                                                        {getTypeLabel(category.type)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <code className="text-muted small">{category.color}</code>
                                                </td>
                                                <td>
                                                    {category.icon && <code className="text-muted small">{category.icon}</code>}
                                                </td>
                                                <td className="text-end">
                                                    {!category.is_predefined && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary me-1"
                                                                onClick={() => startEdit(category)}
                                                            >
                                                                <i className="bi bi-pencil" />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => deleteCategory(category.id)}
                                                            >
                                                                <i className="bi bi-trash" />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
