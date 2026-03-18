import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />
            <h5 className="fw-bold mb-2">Reset Password</h5>
            <p className="text-muted small mb-3">Enter your email and we'll send you a reset link.</p>

            {status && (
                <div className="alert alert-success small py-2" role="alert">{status}</div>
            )}

            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email address</label>
                    <input id="email" type="email"
                        className={`form-control${errors.email ? ' is-invalid' : ''}`}
                        value={data.email} onChange={(e) => setData('email', e.target.value)}
                        autoFocus required />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                    {processing ? 'Sending…' : 'Send Reset Link'}
                </button>
            </form>
        </GuestLayout>
    );
}
