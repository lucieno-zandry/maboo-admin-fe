// notification-bell.tsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useNotifications } from "../hooks/use-notifications";

const LAST_SEEN_KEY = "notifications_last_seen";

function getLastSeen(): string | null {
    return localStorage.getItem(LAST_SEEN_KEY);
}

function setLastSeen(value: string): void {
    localStorage.setItem(LAST_SEEN_KEY, value);
}

type NotificationBellProps = {
    onClick?: () => void
}

export function NotificationBell(props: NotificationBellProps) {
    const { notifications } = useNotifications();

    const [lastSeen, setLastSeenState] = useState<string | null>(getLastSeen());

    // Compute unread count based on lastSeen timestamp
    const unreadCount = (notifications || []).filter((n) => {
        if (n.read_at) return false;
        if (!lastSeen) return true; // first visit: all notifications are unread
        return new Date(n.created_at) > new Date(lastSeen);
    }).length;

    const handleClick = () => {
        props.onClick?.();
        const now = new Date().toISOString();
        setLastSeen(now);
        setLastSeenState(now);
    };

    const hasUnread = unreadCount > 0;
    const badge = unreadCount > 99 ? "99+" : String(unreadCount);

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative group"
            onClick={handleClick}
        >
            <Bell
                className={cn(
                    "h-5 w-5 transition-all",
                    hasUnread
                        ? "text-foreground drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                        : "text-muted-foreground group-hover:text-foreground"
                )}
            />
            {hasUnread && (
                <span
                    className={cn(
                        "absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center",
                        "rounded-full bg-gradient-to-br from-violet-500 to-violet-600",
                        "px-1 text-[10px] font-bold leading-[18px] text-white",
                        "ring-2 ring-background",
                        "animate-in zoom-in-50 duration-200"
                    )}
                >
                    {badge}
                </span>
            )}
        </Button>
    );
}