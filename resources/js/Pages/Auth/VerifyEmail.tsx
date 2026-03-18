import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    return (
        <GuestLayout>
            <Head title="Email Verification" />
            <h5 className="fw-bold mb-2">Verify Your Email</h5>
            <p className="text-muted small mb-3">
                Thanks for signing up! Please verify your email by clicking the link we sent you.
            </p>
            {status === 'verification-link-sent' && (
                <div className="alert alert-success small py-2 mb-3">A new verification link has been sent.</div>
            )}
            <div className="d-flex gap-2">
                <button className="btn btn-primary" disabled={processing}
                    onClick={() => post(route('verification.send'))}>
                    {processing ? 'Sending…' : 'Resend Verification Email'}
                </button>
                <Link href={route('logout')} method="post" as="button" className="btn btn-outline-secondary">
                    Log Out
                </Link>
            </div>
        </GuestLayout>
    );
}
