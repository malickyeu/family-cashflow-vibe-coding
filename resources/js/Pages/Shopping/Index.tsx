import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ShoppingList } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    lists: ShoppingList[];
    showArchived: boolean;
}

export default function ShoppingIndex({ lists, showArchived }: Props) {
    const t = useTrans();
    const [showCreateForm, setShowCreateForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('shopping.store'), {
            onSuccess: () => { reset(); setShowCreateForm(false); },
        });
    };

    return (
        <AppLayout>
            <Head title={t('shopping_lists')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{t('shopping_lists')}</h4>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary"
                        onClick={() => router.get(route('shopping.index'), { archived: showArchived ? undefined : '1' })}>
                        <i className={`bi ${showArchived ? 'bi-inbox' : 'bi-archive'} me-1`} />
                        {showArchived ? t('active_lists') : t('archived')}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                        <i className="bi bi-plus-lg me-1" /> {t('new_list')}
                    </button>
                </div>
            </div>

            {/* Create form */}
            {showCreateForm && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <form onSubmit={submit} noValidate>
                            <div className="row g-2 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label form-label-sm fw-semibold">{t('list_name')} *</label>
                                    <input className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                        value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label form-label-sm fw-semibold">{t('notes')} ({t('optional')})</label>
                                    <input className="form-control"
                                        value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                </div>
                                <div className="col-auto">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing ? t('creating') : t('create_list')}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary ms-1"
                                        onClick={() => { setShowCreateForm(false); reset(); }}>
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lists grid */}
            {lists.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-cart fs-1 d-block mb-3 opacity-25" />
                    <p>{showArchived ? t('no_archived_lists') : t('no_lists')}</p>
                </div>
            ) : (
                <div className="row g-3">
                    {lists.map((list) => (
                        <div key={list.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Link href={route('shopping.show', list.id)}
                                            className="text-decoration-none text-dark">
                                            <h6 className="fw-bold mb-0">{list.name}</h6>
                                        </Link>
                                        <div className="dropdown">
                                            <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                                                <i className="bi bi-three-dots" />
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <Link href={route('shopping.show', list.id)} className="dropdown-item">
                                                        <i className="bi bi-eye me-2" />{t('view')}
                                                    </Link>
                                                </li>
                                                {!list.is_archived && (
                                                    <li>
                                                        <button className="dropdown-item text-warning"
                                                            onClick={() => { if (confirm(t('archive_list_confirm'))) router.post(route('shopping.archive', list.id)); }}>
                                                            <i className="bi bi-archive me-2" />{t('archive')}
                                                        </button>
                                                    </li>
                                                )}
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <Link href={route('shopping.destroy', list.id)} method="delete" as="button"
                                                        className="dropdown-item text-danger"
                                                        onClick={(e) => { if (!confirm(t('delete_list_confirm'))) e.preventDefault(); }}>
                                                        <i className="bi bi-trash me-2" />{t('delete')}
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {list.notes && (
                                        <p className="text-muted small mb-2">{list.notes}</p>
                                    )}

                                    {/* Progress */}
                                    <div className="mb-2">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-muted">{list.checked_count ?? 0}/{list.item_count ?? 0} {t('items')}</span>
                                            <span className="fw-semibold">{list.progress}%</span>
                                        </div>
                                        <div className="progress" style={{ height: 6 }}>
                                            <div className={`progress-bar ${list.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                                                style={{ width: `${list.progress}%` }} />
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <small className="text-muted">
                                            {t('by')} {list.creator.display_name ?? list.creator.name}
                                        </small>
                                        <Link href={route('shopping.show', list.id)} className="btn btn-sm btn-outline-primary">
                                            {t('open')} <i className="bi bi-arrow-right ms-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
