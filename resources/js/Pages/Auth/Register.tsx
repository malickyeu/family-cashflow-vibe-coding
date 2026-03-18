import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTrans } from '@/hooks/useTranslation';

export default function Register() {
    const t = useTrans();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title={t('register')} />
            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">{t('full_name')}</label>
                    <input id="name" type="text"
                        className={`form-control${errors.name ? ' is-invalid' : ''}`}
                        value={data.name} onChange={(e) => setData('name', e.target.value)}
                        autoComplete="name" autoFocus required />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">{t('email')}</label>
                    <input id="email" type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email} onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username" required />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">{t('password')}</label>
                    <input id="password" type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password} onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password" required />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password_confirmation" className="form-label fw-semibold">{t('confirm_password')}</label>
                    <input id="password_confirmation" type="password"
                        className={`form-control${errors.password_confirmation ? ' is-invalid' : ''}`}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password" required />
                    {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                </div>

                <div className="d-flex align-items-center justify-content-between mt-4">
                    <Link href={route('login')} className="text-decoration-none text-secondary small">
                        {t('already_registered')}
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                        {processing ? t('registering') : t('register')}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
