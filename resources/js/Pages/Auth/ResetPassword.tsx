import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Validation } from '@inertiajs/core';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />
            <h5 className="fw-bold mb-3">Set New Password</h5>
            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email</label>
                    <input id="email" type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email} onChange={(e) => setData('email', e.target.value)}
                        autoComplete="username" required />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">New Password</label>
                    <input id="password" type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password} onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password" autoFocus required />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password_confirmation" className="form-label fw-semibold">Confirm Password</label>
                    <input id="password_confirmation" type="password"
                        className={`form-control${errors.password_confirmation ? ' is-invalid' : ''}`}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password" required />
                    {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                    {processing ? 'Resetting…' : 'Reset Password'}
                </button>
            </form>
        </GuestLayout>
    );
}
