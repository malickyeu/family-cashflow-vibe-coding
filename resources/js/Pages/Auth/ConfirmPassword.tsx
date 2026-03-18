import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />
            <h5 className="fw-bold mb-2">Confirm Password</h5>
            <p className="text-muted small mb-3">This area requires password confirmation.</p>
            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <input id="password" type="password"
                        className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={data.password} onChange={(e) => setData('password', e.target.value)}
                        autoFocus required />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                    {processing ? 'Confirming…' : 'Confirm'}
                </button>
            </form>
        </GuestLayout>
    );
}
