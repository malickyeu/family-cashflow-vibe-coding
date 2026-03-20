import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Todo, User } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';
import { formatDate } from '@/utils/formatters';

interface Filters { status?: string; priority?: string; assigned_to?: string; }
interface Props { todos: Todo[]; users: User[]; filters: Filters; }

const priorityBadge = (p: string) =>
    p === 'high' ? 'bg-danger' : p === 'medium' ? 'bg-warning text-dark' : 'bg-secondary';

export default function TodosIndex({ todos, users, filters }: Props) {
    const t = useTrans();
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title:       '',
        description: '',
        priority:    'medium' as 'low' | 'medium' | 'high',
        due_date:    '',
        assigned_to: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('todos.store'), {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    };

    function applyFilter(key: string, value: string) {
        router.get(route('todos.index'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <AppLayout>
            <Head title={t('todos')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{t('family_todos')}</h4>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <i className="bi bi-plus-lg me-1" /> {t('add_todo')}
                </button>
            </div>

            {/* Add form */}
            {showForm && (
                <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body p-3">
                        <form onSubmit={submit} noValidate>
                            <div className="row g-2 align-items-start">
                                <div className="col-md-4">
                                    <input className={`form-control${errors.title ? ' is-invalid' : ''}`}
                                        placeholder={`${t('name')} *`}
                                        value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                </div>
                                <div className="col-md-2">
                                    <select className="form-select" value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value as 'low' | 'medium' | 'high')}>
                                        <option value="low">{t('low')} {t('priority')}</option>
                                        <option value="medium">{t('medium')} {t('priority')}</option>
                                        <option value="high">{t('high')} {t('priority')}</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <input type="date" className="form-control"
                                        value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                </div>
                                <div className="col-md-2">
                                    <select className="form-select" value={data.assigned_to}
                                        onChange={(e) => setData('assigned_to', e.target.value)}>
                                        <option value="">{t('assigned_to')}…</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.display_name ?? u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-auto">
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing ? '…' : t('add')}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary ms-1"
                                        onClick={() => { setShowForm(false); reset(); }}>
                                        {t('cancel')}
                                    </button>
                                </div>
                            </div>
                            {data.description !== undefined && (
                                <div className="mt-2">
                                    <input className="form-control form-control-sm"
                                        placeholder={`${t('description')} (${t('optional')})`}
                                        value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Filter chips */}
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
                <span className="text-muted small">{t('status')}:</span>
                {[
                    { val: '',          label: t('all') },
                    { val: 'pending',   label: t('pending') },
                    { val: 'completed', label: t('completed') },
                ].map(({ val, label }) => (
                    <button key={val}
                        className={`btn btn-sm ${(filters.status ?? '') === val ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => applyFilter('status', val)}>
                        {label}
                    </button>
                ))}
                <span className="vr mx-1" />
                <span className="text-muted small">{t('priority')}:</span>
                {[
                    { val: '',       label: t('all') },
                    { val: 'high',   label: t('high') },
                    { val: 'medium', label: t('medium') },
                    { val: 'low',    label: t('low') },
                ].map(({ val, label }) => (
                    <button key={val}
                        className={`btn btn-sm ${(filters.priority ?? '') === val ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => applyFilter('priority', val)}>
                        {label}
                    </button>
                ))}
                {users.length > 1 && (
                    <>
                        <span className="vr mx-1" />
                        <select className="form-select form-select-sm" style={{ width: 'auto' }}
                            value={filters.assigned_to ?? ''}
                            onChange={(e) => applyFilter('assigned_to', e.target.value)}>
                            <option value="">{t('all_members')}</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>{u.display_name ?? u.name}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {/* Todos list */}
            <div className="card border-0 shadow-sm">
                <ul className="list-group list-group-flush">
                    {todos.map((todo) => {
                        const isOverdue = !todo.is_completed && todo.due_date && todo.due_date < today;
                        return (
                            <li key={todo.id}
                                className={`list-group-item d-flex align-items-start gap-3 py-3 ${todo.is_completed ? 'opacity-50' : ''}`}>
                                {/* Checkbox */}
                                <div className="form-check mt-1 flex-shrink-0">
                                    <input type="checkbox" className="form-check-input"
                                        style={{ cursor: 'pointer', width: '1.1em', height: '1.1em' }}
                                        checked={todo.is_completed}
                                        onChange={() => router.patch(route('todos.toggle', todo.id))} />
                                </div>
                                {/* Content */}
                                <div className="flex-grow-1 min-w-0">
                                    <div className={`fw-semibold ${todo.is_completed ? 'text-decoration-line-through' : ''}`}>
                                        {todo.title}
                                    </div>
                                    {todo.description && (
                                        <small className="text-muted d-block">{todo.description}</small>
                                    )}
                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                        <span className={`badge ${priorityBadge(todo.priority)}`}>{t(todo.priority)}</span>
                                        {todo.due_date && (
                                            <span className={`badge bg-light text-dark border ${isOverdue ? 'border-danger text-danger' : ''}`}>
                                                <i className={`bi ${isOverdue ? 'bi-exclamation-triangle' : 'bi-calendar3'} me-1`} />
                                                {formatDate(todo.due_date)}
                                            </span>
                                        )}
                                        {todo.assigned_user && (
                                            <span className="badge bg-light text-dark border">
                                                <i className="bi bi-person me-1" />
                                                {todo.assigned_user.display_name ?? todo.assigned_user.name}
                                            </span>
                                        )}
                                        {todo.is_completed && todo.completed_at && (
                                            <span className="badge bg-success">
                                                <i className="bi bi-check2 me-1" />{t('completed')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Delete */}
                                <button className="btn btn-sm btn-light text-danger flex-shrink-0"
                                    onClick={() => { if (confirm(t('delete_todo_confirm'))) router.delete(route('todos.destroy', todo.id)); }}>
                                    <i className="bi bi-trash" />
                                </button>
                            </li>
                        );
                    })}
                    {todos.length === 0 && (
                        <li className="list-group-item text-center text-muted py-5">
                            <i className="bi bi-check2-all fs-2 d-block mb-2 text-success opacity-75" />
                            {t('no_todos')}
                        </li>
                    )}
                </ul>
            </div>
        </AppLayout>
    );
}
