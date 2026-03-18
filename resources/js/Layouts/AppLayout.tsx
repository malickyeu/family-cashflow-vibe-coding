import React, { PropsWithChildren } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTrans } from '@/hooks/useTranslation';

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash, locale } = usePage<PageProps>().props;
    const t = useTrans();
    const user = auth.user;
    const initials = user.name.charAt(0).toUpperCase();
    const avatarColor = user.avatar_color ?? '#0d6efd';
    const displayName = user.display_name ?? user.name;

    const navItems = [
        { label: t('nav_dashboard'),    href: () => route('dashboard'),          icon: 'bi-speedometer2',     routeName: 'dashboard' },
        { label: t('nav_transactions'), href: () => route('transactions.index'), icon: 'bi-arrow-left-right', routeName: 'transactions.*' },
        { label: t('nav_recurring'),    href: () => route('recurring.index'),    icon: 'bi-arrow-repeat',     routeName: 'recurring.*' },
        { label: t('nav_todos'),        href: () => route('todos.index'),        icon: 'bi-check2-square',    routeName: 'todos.*' },
        { label: t('nav_shopping'),     href: () => route('shopping.index'),     icon: 'bi-cart3',            routeName: 'shopping.*' },
    ];

    function switchLocale(newLocale: string) {
        router.post('/locale', { locale: newLocale });
    }

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <nav className="bg-dark text-white d-flex flex-column"
                style={{ width: '220px', minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>

                <div className="p-3 border-bottom border-secondary">
                    <Link href={route('dashboard')} className="text-white text-decoration-none d-flex align-items-center gap-2">
                        <i className="bi bi-cash-coin fs-5" />
                        <span className="fw-bold">{t('app_name')}</span>
                    </Link>
                </div>

                <ul className="nav flex-column mt-2 flex-grow-1 px-2">
                    {navItems.map((item) => {
                        const isActive = route().current(item.routeName);
                        return (
                            <li key={item.routeName} className="nav-item mb-1">
                                <Link
                                    href={item.href()}
                                    className={`nav-link text-white py-2 px-3 d-flex align-items-center gap-2 rounded ${isActive ? 'bg-primary' : ''}`}
                                    style={!isActive ? { opacity: 0.85 } : {}}
                                >
                                    <i className={`bi ${item.icon}`} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                    {user.is_admin && (
                        <li className="nav-item mb-1">
                            <Link
                                href={route('users.index')}
                                className={`nav-link text-white py-2 px-3 d-flex align-items-center gap-2 rounded ${route().current('users.*') ? 'bg-primary' : ''}`}
                                style={!route().current('users.*') ? { opacity: 0.85 } : {}}
                            >
                                <i className="bi bi-people" />
                                <span>{t('nav_users')}</span>
                            </Link>
                        </li>
                    )}
                </ul>

                {/* User section */}
                <div className="p-3 border-top border-secondary">
                    <Link href={route('profile.edit')} className="text-white text-decoration-none d-flex align-items-center gap-2 mb-2">
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{ width: 32, height: 32, backgroundColor: avatarColor, fontSize: 13 }}
                        >
                            {initials}
                        </div>
                        <small className="text-truncate">{displayName}</small>
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="btn btn-sm btn-outline-secondary w-100"
                    >
                        <i className="bi bi-box-arrow-right me-1" /> {t('nav_logout')}
                    </Link>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-grow-1" style={{ marginLeft: '220px', minWidth: 0 }}>
                {/* Top bar */}
                <header className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between sticky-top shadow-sm">
                    <small className="text-muted fw-semibold text-uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                        {t('app_name')}
                    </small>
                    <div className="d-flex align-items-center gap-3">
                        {/* Language switcher */}
                        <div className="btn-group btn-group-sm" role="group">
                            <button
                                type="button"
                                className={`btn ${locale === 'en' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => switchLocale('en')}
                            >
                                EN
                            </button>
                            <button
                                type="button"
                                className={`btn ${locale === 'cs' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => switchLocale('cs')}
                            >
                                CZ
                            </button>
                        </div>
                        <small className="text-muted">
                            <i className="bi bi-clock me-1" />
                            {new Date().toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </small>
                    </div>
                </header>

                {/* Flash messages */}
                <div className="px-4 pt-3">
                    {flash?.success && (
                        <div className="alert alert-success alert-dismissible d-flex align-items-center shadow-sm" role="alert">
                            <i className="bi bi-check-circle-fill me-2" />
                            {flash.success}
                            <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close" />
                        </div>
                    )}
                    {flash?.error && (
                        <div className="alert alert-danger alert-dismissible d-flex align-items-center shadow-sm" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2" />
                            {flash.error}
                            <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close" />
                        </div>
                    )}
                </div>

                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}
