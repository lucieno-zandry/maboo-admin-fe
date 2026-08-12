import { useNotifications } from "./hooks/use-notifications";
import { NotificationsHeader } from "./components/notifications-header";
import { NotificationFilterTabs } from "./components/notification-filter-tabs";
import { BulkActionsBar } from "./components/bulk-actions-bar";
import { NotificationList } from "./components/notification-list";

import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from "~/components/ui/popover";

import { NotificationBell } from "./components/notification-bell";
import { useState } from "react";

/**
 * Notifications Popover
 *
 * Same orchestration logic, but rendered inside a popover.
 */
export function NotificationsPopover() {
    useNotifications();
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor>
                <NotificationBell onClick={() => setOpen(true)} />
            </PopoverAnchor>
            {/* ── Content ───────────────────────────────────────────── */}
            <PopoverContent
                align="end"
                className="w-[380px] p-0 shadow-lg">
                <div className="flex max-h-[500px] flex-col overflow-hidden rounded-xl border bg-card">

                    {/* Header */}
                    <NotificationsHeader />

                    {/* Tabs */}
                    <NotificationFilterTabs />

                    {/* Bulk actions */}
                    <BulkActionsBar />

                    {/* Scrollable list */}
                    <div className="overflow-y-auto">
                        <NotificationList />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}