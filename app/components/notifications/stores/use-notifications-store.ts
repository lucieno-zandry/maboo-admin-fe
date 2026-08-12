import type { AppNotification } from "wle-core";
import { create } from "zustand";

type NotificationsStore = {
  // ── Data ──────────────────────────────────────────────────────────────────
  notifications: AppNotification[] | null;
  unreadCount: number;
  totalPages: number;
  currentPage: number;

  // ── UI ────────────────────────────────────────────────────────────────────
  filter: import("../types/notification-types").NotificationFilter;
  selectedIds: Set<string>;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pendingIds: Set<string>;

  // ── Setters ───────────────────────────────────────────────────────────────
  setLoading: (v: boolean) => void;
  setLoadingMore: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setFilter: (f: import("../types/notification-types").NotificationFilter) => void;

  setNotifications: (
    data: AppNotification[],
    unreadCount: number,
    totalPages: number,
    page: number
  ) => void;
  appendNotifications: (
    data: AppNotification[],
    totalPages: number,
    page: number
  ) => void;

  // ── Optimistic mutations ──────────────────────────────────────────────────
  optimisticMarkRead: (id: string) => void;
  confirmMarkRead: (id: string, updated: AppNotification) => void;
  rollbackMarkRead: (id: string) => void;

  optimisticMarkAllRead: () => void;
  rollbackMarkAllRead: (unreadIds: string[]) => void;

  optimisticRemove: (id: string) => void;
  confirmRemove: (id: string) => void;
  rollbackRemove: (notification: AppNotification) => void;

  optimisticClearRead: () => void;
  rollbackClearRead: (readNotifications: AppNotification[]) => void;

  // ── Pending tracking ──────────────────────────────────────────────────────
  addPending: (id: string) => void;
  removePending: (id: string) => void;

  // ── Selection ─────────────────────────────────────────────────────────────
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
};

// Snapshot store for rollbacks — lives outside zustand to avoid re-renders
const _snapshots = new Map<string, AppNotification>();
let _markAllReadSnapshot: AppNotification[] = [];
let _clearReadSnapshot: AppNotification[] = [];

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: null,
  unreadCount: 0,
  totalPages: 1,
  currentPage: 1,
  filter: "all",
  selectedIds: new Set(),
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pendingIds: new Set(),

  // ── Setters ───────────────────────────────────────────────────────────────

  setLoading: (v) => set({ isLoading: v }),
  setLoadingMore: (v) => set({ isLoadingMore: v }),
  setError: (msg) => set({ error: msg }),
  setFilter: (f) => set({ filter: f }),

  setNotifications: (data, unreadCount, totalPages, page) =>
    set({ notifications: data, unreadCount, totalPages, currentPage: page }),

  appendNotifications: (data, totalPages, page) =>
    set((s) => ({
      notifications: [...s.notifications || [], ...data],
      totalPages,
      currentPage: page,
    })),

  // ── Optimistic: mark single read ─────────────────────────────────────────

  optimisticMarkRead: (id) => {
    const n = get().notifications?.find((n) => n.id === id);
    if (n) _snapshots.set(id, { ...n });

    set((s) => ({
      notifications: s.notifications?.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  confirmMarkRead: (id, updated) => {
    _snapshots.delete(id);
    set((s) => ({
      notifications: s.notifications?.map((n) => (n.id === id ? updated : n)),
    }));
  },

  rollbackMarkRead: (id) => {
    const snapshot = _snapshots.get(id);
    if (!snapshot) return;
    _snapshots.delete(id);
    set((s) => ({
      notifications: s.notifications?.map((n) => (n.id === id ? snapshot : n)),
      unreadCount: s.unreadCount + 1,
    }));
  },

  // ── Optimistic: mark all read ─────────────────────────────────────────────

  optimisticMarkAllRead: () => {
    _markAllReadSnapshot = get().notifications?.map((n) => ({ ...n })) || [];
    set((s) => ({
      notifications: s.notifications?.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  rollbackMarkAllRead: (unreadIds) => {
    const snapshot = _markAllReadSnapshot;
    _markAllReadSnapshot = [];
    set((s) => ({
      notifications: snapshot.length > 0 ? snapshot : s.notifications,
      unreadCount: unreadIds.length,
    }));
  },

  // ── Optimistic: remove ───────────────────────────────────────────────────

  optimisticRemove: (id) => {
    const n = get().notifications?.find((n) => n.id === id);
    if (n) _snapshots.set(`remove_${id}`, { ...n });

    set((s) => {
      const removed = s.notifications?.find((n) => n.id === id);
      return {
        notifications: s.notifications?.filter((n) => n.id !== id),
        unreadCount: removed && !removed.read_at
          ? Math.max(0, s.unreadCount - 1)
          : s.unreadCount,
      };
    });
  },

  confirmRemove: (id) => {
    _snapshots.delete(`remove_${id}`);
  },

  rollbackRemove: (notification) => {
    _snapshots.delete(`remove_${notification.id}`);
    set((s) => {
      // Re-insert in original position (by created_at desc)
      const list = [...s.notifications || [], notification].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return {
        notifications: list,
        unreadCount: !notification.read_at ? s.unreadCount + 1 : s.unreadCount,
      };
    });
  },

  // ── Optimistic: clear read ────────────────────────────────────────────────

  optimisticClearRead: () => {
    _clearReadSnapshot = get().notifications?.map((n) => ({ ...n })) || [];
    set((s) => ({
      notifications: s.notifications?.filter((n) => !n.read_at),
    }));
  },

  rollbackClearRead: (readNotifications) => {
    _clearReadSnapshot = [];
    set((s) => {
      const list = [...s.notifications || [], ...readNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return { notifications: list };
    });
  },

  // ── Pending ───────────────────────────────────────────────────────────────

  addPending: (id) =>
    set((s) => ({ pendingIds: new Set([...s.pendingIds, id]) })),

  removePending: (id) =>
    set((s) => {
      const next = new Set(s.pendingIds);
      next.delete(id);
      return { pendingIds: next };
    }),

  // ── Selection ─────────────────────────────────────────────────────────────

  toggleSelected: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: next };
    }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
}));