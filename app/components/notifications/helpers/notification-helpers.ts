import appPathname from "~/lib/app-pathname";
import type { NotificationFilter, NotificationMeta } from "../types/notification-types";
import type { AppNotification } from "wle-core";

// ─── Relative time ────────────────────────────────────────────────────────────

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

// ─── Notification type → metadata ─────────────────────────────────────────────

export function getNotificationMeta(
  notification: AppNotification,
  lang: string
): NotificationMeta {
  const data = notification.data;

  switch (data.notification_type) {
    case "transaction": {
      const isSuccess = data.type === "payment_success";
      return {
        icon: isSuccess ? "CheckCircle2" : "XCircle",
        color: isSuccess
          ? "text-emerald-500 bg-emerald-500/10"
          : "text-rose-500 bg-rose-500/10",
        label: isSuccess ? "Payment Success" : "Payment Failed",
        linkTo: appPathname(`/orders/${data.order_uuid}`),
      };
    }

    case "shipment": {
      const colorMap: Record<string, string> = {
        SHIPPED: "text-sky-500 bg-sky-500/10",
        DELIVERED: "text-emerald-500 bg-emerald-500/10",
        PROCESSING: "text-amber-500 bg-amber-500/10",
      };
      return {
        icon: "Package",
        color: colorMap[data.status] ?? "text-slate-500 bg-slate-500/10",
        label: `Shipment ${data.status.charAt(0) + data.status.slice(1).toLowerCase()}`,
        linkTo: appPathname(`/orders/${data.order_uuid}`),
      };
    }

    case "refund": {
      const colorMap: Record<string, string> = {
        refund_requested: "text-violet-500 bg-violet-500/10",
        refund_approved: "text-emerald-500 bg-emerald-500/10",
        refund_rejected: "text-rose-500 bg-rose-500/10",
      };
      const labelMap: Record<string, string> = {
        refund_requested: "Refund Requested",
        refund_approved: "Refund Approved",
        refund_rejected: "Refund Rejected",
      };
      return {
        icon: "RotateCcw",
        color: colorMap[data.type] ?? "text-slate-500 bg-slate-500/10",
        label: labelMap[data.type] ?? "Refund",
        linkTo: data.order_uuid ? appPathname(`/orders/${data.order_uuid}`) : undefined,
      };
    }

    case "dispute": {
      const colorMap: Record<string, string> = {
        dispute_opened: "text-rose-500 bg-rose-500/10",
        dispute_resolved: "text-emerald-500 bg-emerald-500/10",
        dispute_cancelled: "text-slate-500 bg-slate-500/10",
      };
      const labelMap: Record<string, string> = {
        dispute_opened: "Dispute Opened",
        dispute_resolved: "Dispute Resolved",
        dispute_cancelled: "Dispute Cancelled",
      };
      return {
        icon: "ShieldAlert",
        color: colorMap[data.type] ?? "text-amber-500 bg-amber-500/10",
        label: labelMap[data.type] ?? "Dispute",
        linkTo: data.order_uuid
          ? appPathname(`/transactions/${data.order_uuid}`)
          : undefined,
      };
    }

    case "client_code": {
      return {
        icon: "Tag",
        color: "text-indigo-500 bg-indigo-500/10",
        label: data.action === "attach" ? "Client Code Assigned" : "Client Code Removed",
        linkTo: appPathname(`/users/${data.user_id}`),
      };
    }

    case "user": {
      const isWaitingApproval = data.type === "user_waiting_approval";
      const isRegistration = data.type === "user_registration";

      if (isRegistration) {
        return {
          icon: "UserPlus",
          color: "text-blue-500 bg-blue-500/10",
          label: "New User Registered",
          linkTo: appPathname(`/users/${data.user_id}`),
        };
      }

      if (isWaitingApproval) {
        return {
          icon: "UserCheck",
          color: "text-amber-500 bg-amber-500/10",
          label: "User Waiting Approval",
          linkTo: appPathname(`/users/${data.user_id}`),
        };
      }

      // fallback for any other user type
      return {
        icon: "User",
        color: "text-slate-500 bg-slate-500/10",
        label: "User Notification",
        linkTo: appPathname(`/users/${data.user_id}`),
      };
    }

    case "system":
    default: {
      return {
        icon: "Bell",
        color: "text-slate-500 bg-slate-500/10",
        label: "System",
      };
    }
  }
}

// ─── Notification message ─────────────────────────────────────────────────────

export function getNotificationMessage(notification: AppNotification): string {
  return notification.data.message ?? "";
}

// ─── Filter tabs config ───────────────────────────────────────────────────────

export const FILTER_TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "transaction", label: "Payments" },
  { value: "shipment", label: "Shipments" },
  { value: "refund", label: "Refunds" },
  { value: "dispute", label: "Disputes" },
  { value: "client_code", label: "Client Codes" },
  { value: "system", label: "System" },
  { value: "user", label: "User" }
];

// ─── Client-side filter (for non-API filters like type tabs) ──────────────────

export function filterNotifications(
  notifications: AppNotification[],
  filter: NotificationFilter
): AppNotification[] {
  if (filter === "all") return notifications;
  if (filter === "unread") return notifications.filter((n) => !n.read_at);
  return notifications.filter((n) => n.data.notification_type === filter);
}

// ─── Unread count badge ───────────────────────────────────────────────────────

export function formatUnreadCount(count: number): string {
  if (count === 0) return "";
  if (count > 99) return "99+";
  return String(count);
}