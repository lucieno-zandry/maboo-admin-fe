import { useNotificationsStore } from "../stores/use-notifications-store";
import { loadMore } from "../actions/notification-actions";

import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { NotificationItem } from "./notification-item";
import { NotificationListSkeleton } from "./notification-list-skeleton";
import { NotificationEmpty } from "./notification-empty";
import { filterNotifications } from "../helpers/notification-helpers";
import type { NotificationFilter } from "../types/notification-types";
import { loadNotifications } from "../actions/notification-actions";
import { NotificationsErrorView } from "./notifications-error";
import type { AppNotification } from "wle-core";

// ─── Date group label ─────────────────────────────────────────────────────────

function getGroupLabel(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, now)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 7) return "This week";
    if (diff < 30) return "This month";
    return "Older";
}

function groupByDate(notifications: AppNotification[]) {
    const groups: { label: string; items: AppNotification[] }[] = [];
    const seen = new Map<string, number>();

    for (const n of notifications) {
        const label = getGroupLabel(n.created_at);
        if (!seen.has(label)) {
            seen.set(label, groups.length);
            groups.push({ label, items: [] });
        }
        groups[seen.get(label)!].items.push(n);
    }

    return groups;
}

// ─── Date group header ────────────────────────────────────────────────────────

function DateGroupHeader({ label }: { label: string }) {
    return (
        <div className="sticky top-0 z-10 border-b border-border/30 bg-muted/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

// ─── Load more ────────────────────────────────────────────────────────────────

function LoadMoreButton({
    isLoadingMore,
    onClick,
}: {
    isLoadingMore: boolean;
    onClick: () => void;
}) {
    return (
        <div className="flex justify-center p-4">
            <Button
                variant="outline"
                size="sm"
                onClick={onClick}
                disabled={isLoadingMore}
                className="gap-2 text-xs"
            >
                {isLoadingMore ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                )}
                {isLoadingMore ? "Loading…" : "Load more"}
            </Button>
        </div>
    );
}

// ─── Main view ────────────────────────────────────────────────────────────────

type Props = {
    notifications: AppNotification[];
    filter: NotificationFilter;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
};

export function NotificationListView({
    notifications,
    filter,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    onLoadMore,
}: Props) {
    if (isLoading) {
        return <NotificationListSkeleton count={8} />;
    }

    if (error) {
        return (
            <NotificationsErrorView
                message={error}
                onRetry={() => loadNotifications(1)}
            />
        );
    }

    // Client-side filter for type tabs (all/unread fetched from API;
    // type tabs filter the already-loaded list to avoid extra round-trips)
    const filtered =
        filter === "all" || filter === "unread"
            ? notifications
            : filterNotifications(notifications, filter);

    if (filtered.length === 0) {
        return <NotificationEmpty />;
    }

    const groups = groupByDate(filtered);

    return (
        <div>
            {groups.map((group) => (
                <div key={group.label}>
                    <DateGroupHeader label={group.label} />
                    {group.items.map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </div>
            ))}

            {hasMore && (
                <LoadMoreButton isLoadingMore={isLoadingMore} onClick={onLoadMore} />
            )}
        </div>
    );
}

export function NotificationList() {
    const {
        notifications,
        filter,
        isLoading,
        isLoadingMore,
        error,
        currentPage,
        totalPages,
    } = useNotificationsStore();

    const hasMore = currentPage < totalPages;

    return (
        <NotificationListView
            notifications={notifications || []}
            filter={filter}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
        />
    );
}