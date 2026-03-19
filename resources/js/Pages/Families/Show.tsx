import React from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { FamilyMember } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface FamilyDetail {
    id: number;
    name: string;
    created_by: number;
    owner: { id: number; name: string; display_name: string | null };
}

interface Props {
    family: FamilyDetail;
    members: FamilyMember[];
    userRole: 'owner' | 'member';
}

export default function FamiliesShow({ family, members, userRole }: Props) {
    const t = useTrans();
    const { auth } = usePage<PageProps>().props;
    const isOwner = userRole === 'owner';

    const inviteForm = useForm({ email: '' });

    function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        inviteForm.post(route('families.invite', family.id), {
            onSuccess: () => inviteForm.reset(),
        });
    }

    function handleRemoveMember(userId: number) {
        if (!confirm(t('confirm_remove_member'))) return;
        router.delete(route('families.remove-member', { family: family.id, user: userId }));
    }

    function handleDeleteFamily() {
        if (!confirm(t('confirm_delete_family'))) return;
        router.delete(route('families.destroy', family.id));
    }

    return (
        <AppLayout>
            <Head title={`${t('managing_family')} – ${family.name}`} />

            <div className="d-flex align-items-center gap-3 mb-4">
                <Link href={route('families.index')} className="btn btn-outline-secondary btn-sm">
                    <i className="bi bi-arrow-left me-1" />
                    {t('families')}
                </Link>
                <h1 className="h3 mb-0">
                    <i className="bi bi-people me-2 text-primary" />
                    {family.name}
                </h1>
            </div>

            <div className="row g-4">
                {/* Členové rodiny */}
                <div className="col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">
                                <i className="bi bi-people me-2" />
                                {t('members')}
                                <span className="badge bg-secondary ms-2">{members.length}</span>
                            </h5>
                        </div>
                        <ul className="list-group list-group-flush">
                            {members.map(member => {
                                const initials = member.name.charAt(0).toUpperCase();
                                const color = member.avatar_color ?? '#6c757d';
                                const isMe = member.id === auth.user.id;
                                const isMemberOwner = member.role === 'owner';
                                return (
                                    <li key={member.id} className="list-group-item d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                            style={{ width: 36, height: 36, backgroundColor: color, fontSize: 14 }}
                                        >
                                            {initials}
                                        </div>
                                        <div className="flex-grow-1 min-width-0">
                                            <div className="fw-semibold text-truncate">
                                                {member.display_name ?? member.name}
                                                {isMe && (
                                                    <span className="badge bg-light text-muted ms-2 fw-normal">{t('you')}</span>
                                                )}
                                            </div>
                                            <small className="text-muted">{member.email}</small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                            <span className={`badge ${isMemberOwner ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                {isMemberOwner ? t('family_owner') : t('family_member_role')}
                                            </span>
                                            {isOwner && !isMemberOwner && (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    title={t('remove_member')}
                                                >
                                                    <i className="bi bi-person-x" />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Pravý panel – pozvání + nebezpečná zóna */}
                <div className="col-lg-5">
                    {/* Pozvat člena */}
                    {isOwner && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bi bi-person-plus me-2" />
                                    {t('invite_member')}
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleInvite}>
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">
                                            {t('invite_by_email')}
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${inviteForm.errors.email ? 'is-invalid' : ''}`}
                                            placeholder="uzivatel@example.com"
                                            value={inviteForm.data.email}
                                            onChange={e => inviteForm.setData('email', e.target.value)}
                                            required
                                        />
                                        {inviteForm.errors.email && (
                                            <div className="invalid-feedback">{inviteForm.errors.email}</div>
                                        )}
                                        <small className="text-muted">{t('user_not_found')}</small>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={inviteForm.processing}
                                    >
                                        <i className="bi bi-send me-1" />
                                        {inviteForm.processing ? t('saving') : t('invite_member')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Nebezpečná zóna */}
                    {isOwner && (
                        <div className="card shadow-sm border-danger">
                            <div className="card-header bg-danger text-white">
                                <h5 className="mb-0">
                                    <i className="bi bi-exclamation-triangle me-2" />
                                    {t('delete_family')}
                                </h5>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small mb-3">{t('confirm_delete_family')}</p>
                                <button
                                    className="btn btn-danger w-100"
                                    onClick={handleDeleteFamily}
                                >
                                    <i className="bi bi-trash me-1" />
                                    {t('delete_family')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
