import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTrans } from '@/hooks/useTranslation';

const AVATAR_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4',
    '#0d6efd', '#dc3545', '#198754', '#fd7e14', '#6c757d',
];

interface EditUser {
    id: number;
    name: string;
    display_name: string | null;
    email: string;
    avatar_color: string | null;
    locale: string;
    role: 'admin' | 'member';
}

interface Props {
    editUser?: EditUser;
}

export default function UsersForm({ editUser }: Props) {
    const t = useTrans();
    const isEditing = !!editUser;

    const { data, setData, post, put, processing, errors } = useForm({
        name:                  editUser?.name          ?? '',
        display_name:          editUser?.display_name  ?? '',
        email:                 editUser?.email         ?? '',
        avatar_color:          editUser?.avatar_color  ?? '#0d6efd',
        locale:                editUser?.locale        ?? 'en',
        password:              '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('users.update', editUser!.id));
        } else {
            post(route('users.store'));
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? t('edit_member') : t('new_member')} />

            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom py-3">
                            <div className="d-flex align-items-center gap-2">
                                <Link href={route('users.index')} className="btn btn-sm btn-light">
                                    <i className="bi bi-arrow-left" />
                                </Link>
                                <h5 className="mb-0 fw-semibold">
                                    {isEditing ? t('edit_member') : t('new_member')}
                                </h5>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={submit} noValidate>
                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="name" className="form-label fw-semibold">{t('full_name')}</label>
                                        <input id="name" type="text"
                                            className={`form-control${errors.name ? ' is-invalid' : ''}`}
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="display_name" className="form-label fw-semibold">
                                            {t('display_name')}
                                            <span className="text-muted fw-normal ms-1 small">({t('optional')})</span>
                                        </label>
                                        <input id="display_name" type="text"
                                            className="form-control"
                                            value={data.display_name}
                                            onChange={(e) => setData('display_name', e.target.value)} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">{t('email_address')}</label>
                                    <input id="email" type="email"
                                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="off" required />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold d-block mb-2">{t('avatar_color')}</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {AVATAR_COLORS.map((color) => (
                                            <button key={color} type="button"
                                                onClick={() => setData('avatar_color', color)}
                                                style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    backgroundColor: color, padding: 0, cursor: 'pointer',
                                                    border: data.avatar_color === color
                                                        ? '3px solid #212529' : '3px solid transparent',
                                                    outline: data.avatar_color === color ? '2px solid white' : 'none',
                                                    outlineOffset: '-4px',
                                                }}
                                                title={color}
                                            />
                                        ))}
                                        <div className="ms-2 d-flex align-items-center gap-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 32, height: 32, backgroundColor: data.avatar_color }}>
                                                {data.name.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <small className="text-muted">{t('preview')}</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="locale" className="form-label fw-semibold">{t('locale')}</label>
                                    <select id="locale" className="form-select"
                                        value={data.locale}
                                        onChange={(e) => setData('locale', e.target.value)}>
                                        <option value="en">{t('english')}</option>
                                        <option value="cs">{t('czech')}</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label fw-semibold">
                                        {t('password')}
                                        {isEditing && (
                                            <span className="text-muted fw-normal ms-1 small">({t('optional')})</span>
                                        )}
                                    </label>
                                    <input id="password" type="password"
                                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        required={!isEditing} />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password_confirmation" className="form-label fw-semibold">{t('confirm_password')}</label>
                                    <input id="password_confirmation" type="password"
                                        className={`form-control${errors.password_confirmation ? ' is-invalid' : ''}`}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password" />
                                    {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary px-4" disabled={processing}>
                                        {processing ? t('saving') : t('save')}
                                    </button>
                                    <Link href={route('users.index')} className="btn btn-outline-secondary">
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
