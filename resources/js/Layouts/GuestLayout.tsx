import { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div className="text-center mb-4">
                    <i className="bi bi-cash-coin text-primary" style={{ fontSize: '2.5rem' }} />
                    <h4 className="fw-bold mt-2 mb-0">Family CashFlow</h4>
                    <small className="text-muted">Manage your family finances</small>
                </div>
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body p-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
