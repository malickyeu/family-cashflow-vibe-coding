import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    canResetPassword: boolean;
    status?: string;
}

export default function Login({ canResetPassword, status }: Props) {
    const t = useTrans();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title={t('login')} />

            {status && (
                <div className="alert alert-success mb-3 py-2 small" role="alert">{status}</div>
            )}

            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">{t('email')}</label>
                    <input
                        id="email" type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username" autoFocus required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">{t('password')}</label>
                    <input
                        id="password" type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password" required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3 form-check">
                    <input
                        id="remember" type="checkbox" className="form-check-input"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <label htmlFor="remember" className="form-check-label">{t('remember_me')}</label>
                </div>

                <div className="d-flex align-items-center justify-content-between mt-4">
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-decoration-none text-secondary small">
                            {t('forgot_password')}
                        </Link>
                    )}
                    <button type="submit" className="btn btn-primary ms-auto" disabled={processing}>
                        {processing ? t('logging_in') : t('login')}
                    </button>
                </div>

                <hr className="my-3" />
                <p className="text-center mb-0 small text-muted">
                    {t('no_account')}{' '}
                    <Link href={route('register')} className="text-decoration-none fw-semibold">{t('register_here')}</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
