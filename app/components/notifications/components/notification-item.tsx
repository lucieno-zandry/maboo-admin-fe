import { useParams } from "react-router";
import { useNotificationsStore } from "../stores/use-notifications-store";
import {
    markAsRead,
    deleteNotification,
    toggleSelection,
} from "../actions/notification-actions";
import {
    getNotificationMeta,
    getNotificationMessage,
} from "../helpers/notification-helpers";

import { Link } from "react-router";
import { Trash2, MailOpen, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { NotificationIcon } from "./notification-icon";
import { timeAgo } from "../helpers/notification-helpers";
import type { NotificationMeta } from "../types/notification-types";
import type { AppNotification } from "wle-core";

type NotificationItemViewProps = {
    notification: AppNotification;
    meta: NotificationMeta;
    message: string;
    isSelected: boolean;
    isPending: boolean;
    isRead: boolean;
    onSelect: () => void;
    onMarkRead: () => void;
    onDelete: () => void;
};

export function NotificationItemView({
    notification,
    meta,
    message,
    isSelected,
    isPending,
    isRead,
    onSelect,
    onMarkRead,
    onDelete,
}: NotificationItemViewProps) {
    return (
        <div
            className={cn(
                "group relative flex items-start gap-3 px-4 py-4 transition-all duration-150",
                "border-b border-border/30 last:border-0",
                !isRead && "bg-violet-500/[0.03]",
                isSelected && "bg-violet-500/10",
                isPending && "opacity-60",
                "hover:bg-muted/40"
            )}
        >
            {/* Unread dot */}
            {!isRead && (
                <span className="absolute left-1.5 top-5 h-1.5 w-1.5 rounded-full bg-violet-500" />
            )}

            {/* Checkbox */}
            <label className="mt-0.5 flex shrink-0 cursor-pointer items-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="h-3.5 w-3.5 rounded border-border accent-violet-500"
                />
            </label>

            {/* Icon */}
            <NotificationIcon name={meta.icon} colorClass={meta.color} size="md" />

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <span
                        className={cn(
                            "text-xs font-semibold uppercase tracking-wider",
                            isRead ? "text-muted-foreground" : "text-violet-600 dark:text-violet-400"
                        )}
                    >
                        {meta.label}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground/60 tabular-nums">
                        {timeAgo(notification.created_at)}
                    </span>
                </div>

                <p
                    className={cn(
                        "mt-0.5 text-sm leading-snug",
                        isRead ? "text-muted-foreground" : "text-foreground font-medium"
                    )}
                >
                    {message}
                </p>

                {/* Deep link */}
                {meta.linkTo && (
                    <Link
                        to={meta.linkTo}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline dark:text-violet-400"
                    >
                        <ExternalLink className="h-3 w-3" />
                        View details
                    </Link>
                )}
            </div>

            {/* Actions — appear on hover */}
            <div
                className={cn(
                    "flex shrink-0 items-center gap-1 transition-opacity",
                    "opacity-0 group-hover:opacity-100",
                    isPending && "pointer-events-none"
                )}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                    <>
                        {!isRead && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
                                title="Mark as read"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <MailOpen className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

type Props = {
    notification: AppNotification;
};

export function NotificationItem({ notification }: Props) {
    const params = useParams();
    const lang = (params as any).lang ?? "en";

    const { selectedIds, pendingIds } = useNotificationsStore();

    const meta = getNotificationMeta(notification, lang);
    const message = getNotificationMessage(notification);
    const isSelected = selectedIds.has(notification.id);
    const isPending = pendingIds.has(notification.id);
    const isRead = !!notification.read_at;
    
    return (
        <NotificationItemView
            notification={notification}
            meta={meta}
            message={message}
            isSelected={isSelected}
            isPending={isPending}
            isRead={isRead}
            onSelect={() => toggleSelection(notification.id)}
            onMarkRead={() => markAsRead(notification.id)}
            onDelete={() => deleteNotification(notification.id)}
        />
    );
}