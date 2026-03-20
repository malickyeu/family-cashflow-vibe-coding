/**
 * Format currency amount using browser's locale
 */
export function formatCurrency(amount: number | string, currency: string = 'CZK'): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}

/**
 * Format date to localized short format (e.g., 20. 3. 2026)
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(d);
}

/**
 * Format date and time to localized format
 */
export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

/**
 * Format date to relative format (e.g., "today", "yesterday", "3 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'dnes';
    } else if (diffDays === 1) {
        return 'včera';
    } else if (diffDays === -1) {
        return 'zítra';
    } else if (diffDays > 0 && diffDays < 7) {
        return `před ${diffDays} dny`;
    } else if (diffDays < 0 && diffDays > -7) {
        return `za ${Math.abs(diffDays)} dní`;
    }
    
    return formatDate(d);
}

/**
 * Get number of days until a specific date
 */
export function getDaysUntil(dateStr: string): number {
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}
