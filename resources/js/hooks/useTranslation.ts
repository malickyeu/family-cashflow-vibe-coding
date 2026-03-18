import { usePage } from '@inertiajs/react';

type PageProps = {
    translations: Record<string, string>;
    [key: string]: unknown;
};

export function useTrans() {
    const { translations } = usePage<PageProps>().props;

    return function t(key: string, replace?: Record<string, string>): string {
        let value = translations?.[key] ?? key;

        if (replace) {
            Object.entries(replace).forEach(([k, v]) => {
                value = value.replace(`:${k}`, v);
            });
        }

        return value;
    };
}
