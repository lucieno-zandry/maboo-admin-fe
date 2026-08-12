// ─── Filter Tab ──────────────────────────────────────────────────────────────

import type { AppNotification } from "wle-core";

export type NotificationFilter = "all" | "unread" | "transaction" | "shipment" | "refund" | "dispute" | "client_code" | "user" | "system";

// ─── UI-enriched notification (wraps AppNotification) ────────────────────────

export type NotificationMeta = {
    icon: string;        // lucide icon name key
    color: string;       // tailwind color class
    label: string;       // human-readable type label
    linkTo?: string;     // optional deep-link path
};

// ─── Bulk action ─────────────────────────────────────────────────────────────

export type BulkAction = "mark-read" | "delete";

// ─── Store state ─────────────────────────────────────────────────────────────

export type NotificationsState = {
    // Data
    notifications: AppNotification[];
    unreadCount: number;
    totalPages: number;
    currentPage: number;

    // UI state
    filter: NotificationFilter;
    selectedIds: Set<string>;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;

    // Optimistic UI tracking
    pendingIds: Set<string>;  // IDs with in-flight mutations
};