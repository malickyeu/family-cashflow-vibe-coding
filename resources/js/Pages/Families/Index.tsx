import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import { Family } from '@/types/models';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    families: Array<Family & { members_count: number; pivot_role: 'owner' | 'member'; owner: { name: string; display_name: string | null } }>;
}

export default function FamiliesIndex({ families }: Props) {
    const t = useTrans();
    const { currentFamily } = usePage<PageProps>().props;
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        router.post(route('families.store'), { name }, {
            onFinish: () => { setName(''); setCreating(false); },
        });
    }

    function handleSwitch(familyId: number | null) {
        router.post(route('family.switch'), { family_id: familyId });
    }

    return (
        <AppLayout>
            <Head title={t('families')} />

            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0">
                    <i className="bi bi-people me-2 text-primary" />
                    {t('families')}
                </h1>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setCreating(v => !v)}
                >
                    <i className="bi bi-plus-lg me-1" />
                    {t('new_family')}
                </button>
            </div>

            {/* Formulář pro vytvoření rodiny */}
            {creating && (
                <div className="card mb-4 shadow-sm border-primary">
                    <div className="card-body">
                        <h6 className="card-title">{t('create_family')}</h6>
                        <form onSubmit={handleCreate} className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder={t('family_name')}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary btn-sm text-nowrap">
                                {t('create_family')}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCreating(false)}>
                                {t('cancel')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Aktuální kontext */}
            <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
                <i className={`bi ${currentFamily ? 'bi-people-fill' : 'bi-person-fill'} fs-5`} />
                <div>
                    <strong>{t('current_context')}:</strong>{' '}
                    {currentFamily ? currentFamily.name : t('personal_mode')}
                </div>
                {currentFamily && (
                    <button
                        className="btn btn-sm btn-outline-secondary ms-auto"
                        onClick={() => handleSwitch(null)}
                    >
                        <i className="bi bi-person me-1" />
                        {t('switch_to_personal')}
                    </button>
                )}
            </div>

            {/* Seznam rodin */}
            {families.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-people fs-1 d-block mb-3" />
                    <p>{t('no_families')}</p>
                </div>
            ) : (
                <div className="row g-3">
                    {families.map(family => {
                        const isActive = currentFamily?.id === family.id;
                        return (
                            <div key={family.id} className="col-md-6 col-lg-4">
                                <div className={`card h-100 shadow-sm ${isActive ? 'border-primary' : ''}`}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-start justify-content-between mb-2">
                                            <h5 className="card-title mb-0">
                                                <i className="bi bi-people me-2 text-primary" />
                                                {family.name}
                                            </h5>
                                            {isActive && (
                                                <span className="badge bg-primary">{t('active')}</span>
                                            )}
                                        </div>
                                        <p className="text-muted small mb-1">
                                            <i className="bi bi-person-circle me-1" />
                                            {family.owner?.display_name ?? family.owner?.name}
                                        </p>
                                        <p className="text-muted small mb-3">
                                            <i className="bi bi-people me-1" />
                                            {family.members_count} {t('members')}
                                            {' · '}
                                            <span className={`badge ${family.pivot_role === 'owner' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                {family.pivot_role === 'owner' ? t('family_owner') : t('family_member_role')}
                                            </span>
                                        </p>
                                        <div className="d-flex gap-2">
                                            <Link
                                                href={route('families.show', family.id)}
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                <i className="bi bi-gear me-1" />
                                                {t('managing_family')}
                                            </Link>
                                            {!isActive && (
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleSwitch(family.id)}
                                                >
                                                    <i className="bi bi-arrow-repeat me-1" />
                                                    {t('switch_to_family')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
