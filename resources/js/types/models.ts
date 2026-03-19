export interface User {
    id: number;
    name: string;
    display_name: string | null;
    avatar_color: string | null;
    email: string;
    email_verified_at: string | null;
    locale: string;
    role: 'admin' | 'member';
    current_family_id: number | null;
}

export interface FamilyMember {
    id: number;
    name: string;
    display_name: string | null;
    email: string;
    avatar_color: string | null;
    role: 'owner' | 'member';
}

export interface Family {
    id: number;
    name: string;
    created_by: number;
    owner?: User;
    members_count?: number;
    pivot_role?: 'owner' | 'member';
}

export interface Category {
    id: number;
    name: string;
    color: string;
    icon: string | null;
    type: 'income' | 'expense' | 'both';
    is_predefined: boolean;
    user_id: number | null;
}

export interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: string;
    date: string;
    description: string | null;
    category: Category | null;
    category_id: number | null;
    user: User;
    user_id: number;
    creator?: User;
    created_by: number;
    recurring_payment_id: number | null;
    is_auto_generated: boolean;
    created_at: string;
    updated_at: string;
}

export interface RecurringPayment {
    id: number;
    name: string;
    amount: string;
    frequency: 'monthly' | 'yearly';
    next_due_date: string;
    category: Category | null;
    category_id: number | null;
    user: User;
    user_id: number;
    notes: string | null;
    is_active: boolean;
    send_reminder: boolean;
    reminder_days_before: number;
    created_at: string;
}

export interface Todo {
    id: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    assigned_to: number | null;
    assigned_user: User | null;
    created_by: number;
    creator: User;
    is_completed: boolean;
    completed_at: string | null;
    created_at: string;
}

export interface ShoppingList {
    id: number;
    name: string;
    notes: string | null;
    created_by: number;
    creator: User;
    is_archived: boolean;
    archived_at: string | null;
    progress: number;
    item_count?: number;
    checked_count?: number;
    total_price?: number;
    paid_price?: number;
    items?: ShoppingListItem[];
    created_at: string;
    updated_at: string;
}

export interface ShoppingListItem {
    id: number;
    shopping_list_id: number;
    name: string;
    quantity: string;
    unit: string | null;
    price: string | null;
    notes: string | null;
    is_checked: boolean;
    checked_by: User | null;
    checked_at: string | null;
    sort_order: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}
