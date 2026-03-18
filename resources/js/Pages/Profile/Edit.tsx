import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { useTrans } from '@/hooks/useTranslation';

interface Props extends PageProps {
    mustVerifyEmail: boolean;
    status?: string;
}

const AVATAR_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4',
    '#0d6efd', '#dc3545', '#198754', '#fd7e14', '#6c757d',
];

export default function ProfileEdit({ auth, mustVerifyEmail, status }: Props) {
    const user = auth.user;
    const t = useTrans();

    const {
        data: profileData, setData: setProfileData,
        patch: patchProfile, processing: profileProcessing,
        errors: profileErrors, recentlySuccessful: profileSaved,
    } = useForm({
        name:         user.name,
        display_name: user.display_name ?? '',
        avatar_color: user.avatar_color ?? '#0d6efd',
        email:        user.email,
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'));
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        data: deleteData, setData: setDeleteData,
        delete: deleteAccount, processing: deleteProcessing,
        errors: deleteErrors, reset: resetDelete,
    } = useForm({ password: '' });

    const submitDelete: FormEventHandler = (e) => {
        e.preventDefault();
        deleteAccount(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setShowDeleteModal(false),
            onFinish: () => resetDelete(),
        });
    };

    return (
        <AppLayout>
            <Head title={t('profile')} />

            <div style={{ maxWidth: 680 }}>
                <h4 className="fw-bold mb-4">{t('profile_settings')}</h4>

                {/* Profile form */}
                <div className="card border-0 shadow-sm rounded-3 mb-4">
                    <div className="card-body p-4">
                        <h5 className="card-title mb-4">{t('profile_info')}</h5>

                        {mustVerifyEmail && !user.email_verified_at && (
                            <div className="alert alert-warning small py-2 mb-3">
                                <i className="bi bi-exclamation-triangle me-1" />
                                {t('email_unverified')}
                            </div>
                        )}
                        {profileSaved && (
                            <div className="alert alert-success small py-2 mb-3">
                                <i className="bi bi-check-circle me-1" />{t('profile_saved')}
                            </div>
                        )}

                        <form onSubmit={submitProfile} noValidate>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label htmlFor="name" className="form-label fw-semibold">{t('full_name')}</label>
                                    <input id="name" type="text"
                                        className={`form-control${profileErrors.name ? ' is-invalid' : ''}`}
                                        value={profileData.name}
                                        onChange={(e) => setProfileData('name', e.target.value)} required />
                                    {profileErrors.name && <div className="invalid-feedback">{profileErrors.name}</div>}
                                </div>

                                <div className="col-sm-6">
                                    <label htmlFor="display_name" className="form-label fw-semibold">
                                        {t('display_name')}
                                        <span className="text-muted fw-normal ms-1 small">({t('optional')})</span>
                                    </label>
                                    <input id="display_name" type="text"
                                        className="form-control"
                                        value={profileData.display_name}
                                        onChange={(e) => setProfileData('display_name', e.target.value)}
                                        placeholder={t('shown_in_app')} />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold d-block mb-2">{t('avatar_color')}</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {AVATAR_COLORS.map((color) => (
                                            <button key={color} type="button"
                                                onClick={() => setProfileData('avatar_color', color)}
                                                style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    backgroundColor: color, padding: 0, cursor: 'pointer',
                                                    border: profileData.avatar_color === color
                                                        ? '3px solid #212529' : '3px solid transparent',
                                                    outline: profileData.avatar_color === color ? '2px solid white' : 'none',
                                                    outlineOffset: '-4px',
                                                }}
                                                title={color}
                                            />
                                        ))}
                                        <div className="ms-2 d-flex align-items-center gap-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 32, height: 32, backgroundColor: profileData.avatar_color }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <small className="text-muted">{t('preview')}</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label htmlFor="email" className="form-label fw-semibold">{t('email_address')}</label>
                                    <input id="email" type="email"
                                        className={`form-control${profileErrors.email ? ' is-invalid' : ''}`}
                                        value={profileData.email}
                                        onChange={(e) => setProfileData('email', e.target.value)}
                                        autoComplete="username" required />
                                    {profileErrors.email && <div className="invalid-feedback">{profileErrors.email}</div>}
                                </div>
                            </div>

                            <div className="mt-4">
                                <button type="submit" className="btn btn-primary" disabled={profileProcessing}>
                                    {profileProcessing ? t('saving') : t('save_profile')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Delete account */}
                <div className="card border-0 shadow-sm rounded-3 border-danger border-opacity-25">
                    <div className="card-body p-4">
                        <h5 className="card-title text-danger mb-2">{t('delete_account')}</h5>
                        <p className="text-muted small mb-3">
                            {t('delete_account_desc')}
                        </p>
                        <button type="button" className="btn btn-outline-danger"
                            onClick={() => setShowDeleteModal(true)}>
                            <i className="bi bi-trash me-1" />{t('delete_my_account')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="modal d-block" tabIndex={-1}
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} role="dialog" aria-modal="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title text-danger">
                                    <i className="bi bi-exclamation-triangle me-2" />
                                    {t('confirm_account_deletion')}
                                </h5>
                                <button type="button" className="btn-close"
                                    onClick={() => { setShowDeleteModal(false); resetDelete(); }} />
                            </div>
                            <form onSubmit={submitDelete} noValidate>
                                <div className="modal-body">
                                    <p className="text-muted small mb-3">
                                        {t('confirm_deletion_desc')}
                                    </p>
                                    <label htmlFor="del_pwd" className="form-label fw-semibold">{t('password')}</label>
                                    <input id="del_pwd" type="password"
                                        className={`form-control${deleteErrors.password ? ' is-invalid' : ''}`}
                                        value={deleteData.password}
                                        onChange={(e) => setDeleteData('password', e.target.value)}
                                        autoFocus required />
                                    {deleteErrors.password && (
                                        <div className="invalid-feedback">{deleteErrors.password}</div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-secondary"
                                        onClick={() => { setShowDeleteModal(false); resetDelete(); }}>
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-danger" disabled={deleteProcessing}>
                                        {deleteProcessing ? t('deleting') : t('yes_delete_account')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
