import { FormEventHandler, useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ShoppingList, ShoppingListItem } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Props { list: ShoppingList; }

export default function ShoppingShow({ list }: Props) {
    const t = useTrans();
    const [showAddItem, setShowAddItem] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        quantity: '1',
        unit: '',
        notes: '',
    });

    const addItem: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('shopping.items.store', list.id), {
            onSuccess: () => { reset(); setShowAddItem(false); },
        });
    };

    function toggleItem(item: ShoppingListItem) {
        router.patch(route('shopping.items.update', [list.id, item.id]), {
            is_checked: !item.is_checked,
        }, { preserveScroll: true });
    }

    const items = list.items ?? [];
    const unchecked = items.filter((i) => !i.is_checked);
    const checked   = items.filter((i) => i.is_checked);
    const totalItems = items.length;
    const checkedCount = checked.length;
    const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

    return (
        <AppLayout>
            <Head title={list.name} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item">
                                <Link href={route('shopping.index')} className="text-decoration-none">{t('shopping_lists')}</Link>
                            </li>
                            <li className="breadcrumb-item active">{list.name}</li>
                        </ol>
                    </nav>
                    <h4 className="mb-0 fw-bold">{list.name}</h4>
                    {list.notes && <small className="text-muted">{list.notes}</small>}
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                            if (confirm(t('clear_checked_confirm'))) {
                                router.delete(route('shopping.clear-checked', list.id));
                            }
                        }}>
                        <i className="bi bi-eraser me-1" />{t('clear_checked')}
                    </button>
                    {!list.is_archived && (
                        <button className="btn btn-sm btn-outline-warning"
                            onClick={() => {
                                if (confirm(t('archive_list_confirm'))) {
                                    router.post(route('shopping.archive', list.id));
                                }
                            }}>
                            <i className="bi bi-archive me-1" />{t('archive')}
                        </button>
                    )}
                </div>
            </div>

            {/* Progress */}
            {totalItems > 0 && (
                <div className="mb-4">
                    <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">{checkedCount} {t('of')} {totalItems} {t('items')} {t('checked')}</span>
                        <span className={`fw-semibold ${progress === 100 ? 'text-success' : ''}`}>{progress}%</span>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                        <div className={`progress-bar ${progress === 100 ? 'bg-success' : 'bg-primary'}`}
                            style={{ width: `${progress}%` }} />
                    </div>
                    {progress === 100 && (
                        <p className="text-success small mt-1 mb-0">
                            <i className="bi bi-check-circle-fill me-1" />{t('all_items_checked')}
                        </p>
                    )}
                </div>
            )}

            {/* Unchecked items */}
            <div className="card border-0 shadow-sm mb-3">
                {unchecked.length === 0 && checked.length === 0 ? (
                    <div className="card-body text-center text-muted py-4">
                        <i className="bi bi-cart fs-2 d-block mb-2 opacity-25" />
                        {t('no_items')}
                    </div>
                ) : (
                    <ul className="list-group list-group-flush">
                        {unchecked.map((item) => (
                            <li key={item.id} className="list-group-item d-flex align-items-center gap-3 py-3">
                                <input type="checkbox" className="form-check-input flex-shrink-0"
                                    style={{ cursor: 'pointer', width: '1.2em', height: '1.2em' }}
                                    checked={false} onChange={() => toggleItem(item)} />
                                <div className="flex-grow-1">
                                    <span className="fw-semibold">{item.name}</span>
                                    <span className="text-muted ms-2 small">
                                        {item.quantity} {item.unit || t('pcs')}
                                    </span>
                                    {item.notes && <small className="text-muted d-block">{item.notes}</small>}
                                </div>
                                <button className="btn btn-sm btn-light text-danger flex-shrink-0"
                                    onClick={() => router.delete(route('shopping.items.destroy', [list.id, item.id]))}>
                                    <i className="bi bi-x-lg" />
                                </button>
                            </li>
                        ))}

                        {/* Divider for checked items */}
                        {checked.length > 0 && unchecked.length > 0 && (
                            <li className="list-group-item bg-light py-1">
                                <small className="text-muted">{t('checked_items_label')}</small>
                            </li>
                        )}

                        {checked.map((item) => (
                            <li key={item.id} className="list-group-item d-flex align-items-center gap-3 py-2 opacity-50">
                                <input type="checkbox" className="form-check-input flex-shrink-0"
                                    style={{ cursor: 'pointer', width: '1.2em', height: '1.2em' }}
                                    checked={true} onChange={() => toggleItem(item)} />
                                <div className="flex-grow-1">
                                    <span className="text-decoration-line-through text-muted">{item.name}</span>
                                    <span className="text-muted ms-2 small">
                                        {item.quantity} {item.unit || t('pcs')}
                                    </span>
                                    {item.checked_by && (
                                        <small className="text-muted d-block">
                                            {t('by')} {item.checked_by.display_name ?? item.checked_by.name}
                                        </small>
                                    )}
                                </div>
                                <button className="btn btn-sm btn-light text-danger flex-shrink-0"
                                    onClick={() => router.delete(route('shopping.items.destroy', [list.id, item.id]))}>
                                    <i className="bi bi-x-lg" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Add item */}
            {showAddItem ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                        <form onSubmit={addItem} noValidate>
                            <div className="row g-2 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label form-label-sm fw-semibold">{t('item_name')} *</label>
                                    <input className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                        placeholder="e.g. Milk, Bread…" autoFocus
                                        value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label form-label-sm">{t('quantity')}</label>
                                    <input type="number" step="0.01" min="0.01" className="form-control"
                                        value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label form-label-sm">{t('unit')}</label>
                                    <input className="form-control" placeholder="kg, pcs, l…"
                                        value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label form-label-sm">{t('notes')}</label>
                                    <input className="form-control" placeholder="Optional…"
                                        value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                </div>
                                <div className="col-auto">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing ? '…' : t('add')}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary ms-1"
                                        onClick={() => { setShowAddItem(false); reset(); }}>
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <button className="btn btn-outline-primary w-100" onClick={() => setShowAddItem(true)}>
                    <i className="bi bi-plus-lg me-1" /> {t('add_item_label')}
                </button>
            )}
        </AppLayout>
    );
}
