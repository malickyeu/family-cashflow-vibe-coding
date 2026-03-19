import { Family, User } from './models';

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User & { is_admin: boolean };
    };
    flash: {
        success?: string;
        error?: string;
    };
    ziggy: {
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
    };
    locale: string;
    translations: Record<string, string>;
    currentFamily: Family | null;
    userFamilies: Array<{ id: number; name: string; pivot_role: 'owner' | 'member' }>;
};
