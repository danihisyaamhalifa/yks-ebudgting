import { InertiaLinkProps } from '@inertiajs/vue3';
import type { LucideIcon } from 'lucide-vue-next';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>|string;
    icon?: LucideIcon;
    isActive?: boolean;
    children?: Array<Record<string, any>>;
    params?: Record<string, any>;
    permission?: string | string[]
}

export interface SessionExpiryInfo {
    last_activity: number;
    lifetime_seconds: number;
    remaining_seconds: number;
}

export type AppPageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    session_expiry: SessionExpiryInfo | null;
};

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    type?: 'create' | 'view' | 'update' | 'delete';
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    permissions?: Permission[];
    unit_id?:number;
    unit?: any;
}

export type BreadcrumbItemType = BreadcrumbItem;
