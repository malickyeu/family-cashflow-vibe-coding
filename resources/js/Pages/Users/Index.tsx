import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { User } from '@/types/models';
import { PageProps } from '@/types';
import { useTrans } from '@/hooks/useTranslation';

interface Props {
    users: User[];
}

export default function UsersIndex({ users }: Props) {
    const t = useTrans();
    const { auth } = usePage<PageProps>().props;

    function deleteUser(user: User) {
        if (confirm(t('delete_user_confirm'))) {
            router.delete(route('users.destroy', user.id));
        }
    }

    return (
        <AppLayout>
            <Head title={t('users')} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 fw-bold">{t('users')}</h4>
                <Link href={route('users.create')} className="btn btn-primary">
                    <i className="bi bi-plus-lg me-1" /> {t('add_user')}
                </Link>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: 48 }}></th>
                                <th>{t('name')}</th>
                                <th>{t('display_name')}</th>
                                <th>{t('email')}</th>
                                <th>{t('locale')}</th>
                                <th>{t('role')}</th>
                                <th style={{ width: 100 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const initials = user.name.charAt(0).toUpperCase();
                                const avatarColor = user.avatar_color ?? '#0d6efd';
                                const isSelf = user.id === auth.user.id;
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: 34, height: 34, backgroundColor: avatarColor, fontSize: 14 }}
                                            >
                                                {initials}
                                            </div>
                                        </td>
                                        <td className="fw-semibold">{user.name}</td>
                                        <td className="text-muted">{user.display_name ?? '—'}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {user.locale === 'cs' ? t('czech') : t('english')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                                                {user.role === 'admin' ? t('admin') : t('member_role')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <Link href={route('users.edit', user.id)} className="btn btn-sm btn-light">
                                                    <i className="bi bi-pencil" />
                                                </Link>
                                                {!isSelf && (
                                                    <button className="btn btn-sm btn-light text-danger"
                                                        onClick={() => deleteUser(user)}>
                                                        <i className="bi bi-trash" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-4">{t('no_users')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
