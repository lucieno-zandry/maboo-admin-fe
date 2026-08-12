// ~/stores/coupons-store.ts
import type { Coupon } from "wle-core";
import { create } from "zustand";
import {
    fetchCoupons,
    showCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    bulkDeleteCoupons,
    toggleCouponActive,
} from "~/api/http-requests";
import type { CouponsQueryParams } from "~/types/coupons";

// ─── Types ────────────────────────────────────────────────────────────────────

type CouponsMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

type CouponsState = {
    // List
    coupons: Coupon[];
    meta: CouponsMeta | null;
    listLoading: boolean;
    listError: string | null;

    // Detail
    selectedCouponId: number | null;
    selectedCoupon: Coupon | null;
    detailLoading: boolean;
    detailError: string | null;

    // Query params (source of truth for current filters/pagination)
    params: CouponsQueryParams;

    // Multi-select
    selectedIds: Set<number>;

    // Mutation
    mutating: boolean;
    mutationError: string | null;
};

type CouponsActions = {
    // List
    loadCoupons: (params?: CouponsQueryParams) => Promise<void>;
    setParams: (params: Partial<CouponsQueryParams>) => void;

    // Detail
    selectCoupon: (id: number | null) => void;
    loadDetail: (id: number) => Promise<void>;
    refreshDetail: () => Promise<void>;

    // CRUD
    createCoupon: (
        data: Parameters<typeof createCoupon>[0]
    ) => Promise<Coupon | null>;

    updateCoupon: (
        id: number,
        data: Parameters<typeof updateCoupon>[1]
    ) => Promise<Coupon | null>;

    toggleActive: (id: number, is_active: boolean) => Promise<boolean>;
    deleteCoupon: (id: number) => Promise<boolean>;
    bulkDelete: (ids: number[]) => Promise<boolean>;

    // Selection
    toggleSelect: (id: number) => void;
    selectAll: () => void;
    clearSelection: () => void;

    reset: () => void;
};

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: CouponsState = {
    coupons: [],
    meta: null,
    listLoading: false,
    listError: null,
    selectedCouponId: null,
    selectedCoupon: null,
    detailLoading: false,
    detailError: null,
    params: {
        page: 1,
        per_page: 20,
        sort_by: "created_at",
        sort_order: "desc",
    },
    selectedIds: new Set(),
    mutating: false,
    mutationError: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCouponsStore = create<CouponsState & CouponsActions>(
    (set, get) => ({
        ...initialState,

        // ── List ───────────────────────────────────────────────────────────────

        setParams: (params) =>
            set((s) => ({ params: { ...s.params, ...params } })),

        loadCoupons: async (overrides?) => {
            const params = { ...get().params, ...overrides };
            set({ listLoading: true, listError: null });
            try {
                const { data } = await fetchCoupons(params);
                set({
                    coupons: data!.data,
                    meta: {
                        current_page: data!.current_page,
                        last_page: data!.last_page,
                        per_page: data!.per_page,
                        total: data!.total,
                        from: data!.from,
                        to: data!.to,
                    },
                    listLoading: false,
                    params,
                });
            } catch (e: any) {
                set({
                    listError: e?.message ?? "Failed to load coupons",
                    listLoading: false,
                });
            }
        },

        // ── Detail ─────────────────────────────────────────────────────────────

        selectCoupon: (id) => {
            set({ selectedCouponId: id, selectedCoupon: null, detailError: null });
            if (id !== null) get().loadDetail(id);
        },

        loadDetail: async (id) => {
            set({ detailLoading: true, detailError: null });
            try {
                const res = await showCoupon(id);
                set({ selectedCoupon: res.data?.coupon, detailLoading: false });
            } catch (e: any) {
                set({
                    detailError: e?.message ?? "Failed to load coupon details",
                    detailLoading: false,
                });
            }
        },

        refreshDetail: async () => {
            const id = get().selectedCouponId;
            if (id !== null) await get().loadDetail(id);
        },

        // ── CRUD ───────────────────────────────────────────────────────────────

        createCoupon: async (data) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await createCoupon(data);
                set((s) => ({
                    coupons: [res.data!.coupon, ...s.coupons],
                    meta: s.meta ? { ...s.meta, total: s.meta.total + 1 } : null,
                    mutating: false,
                }));
                return res.data!.coupon;
            } catch (e: any) {
                set({
                    mutationError: e?.message ?? "Failed to create coupon",
                    mutating: false,
                });
                return null;
            }
        },

        updateCoupon: async (id, data) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await updateCoupon(id, data);
                const updated = res.data!.coupon;
                set((s) => ({
                    coupons: s.coupons.map((c) =>
                        c.id === id ? { ...c, ...updated } : c
                    ),
                    selectedCoupon:
                        s.selectedCouponId === id
                            ? { ...s.selectedCoupon!, ...updated }
                            : s.selectedCoupon,
                    mutating: false,
                }));
                return updated;
            } catch (e: any) {
                set({
                    mutationError: e?.message ?? "Failed to update coupon",
                    mutating: false,
                });
                return null;
            }
        },

        toggleActive: async (id, is_active) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await toggleCouponActive(id, is_active);
                const updated = res.data!.coupon;
                set((s) => ({
                    coupons: s.coupons.map((c) =>
                        c.id === id ? { ...c, ...updated } : c
                    ),
                    selectedCoupon:
                        s.selectedCouponId === id
                            ? { ...s.selectedCoupon!, ...updated }
                            : s.selectedCoupon,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({
                    mutationError: e?.message ?? "Failed to toggle coupon",
                    mutating: false,
                });
                return false;
            }
        },

        deleteCoupon: async (id) => {
            set({ mutating: true, mutationError: null });
            try {
                await deleteCoupon(id);
                set((s) => ({
                    coupons: s.coupons.filter((c) => c.id !== id),
                    selectedCouponId:
                        s.selectedCouponId === id ? null : s.selectedCouponId,
                    selectedCoupon:
                        s.selectedCouponId === id ? null : s.selectedCoupon,
                    meta: s.meta ? { ...s.meta, total: s.meta.total - 1 } : null,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({
                    mutationError: e?.message ?? "Failed to delete coupon",
                    mutating: false,
                });
                return false;
            }
        },

        bulkDelete: async (ids) => {
            set({ mutating: true, mutationError: null });
            try {
                await bulkDeleteCoupons(ids);
                const idSet = new Set(ids);
                set((s) => ({
                    coupons: s.coupons.filter((c) => !idSet.has(c.id)),
                    selectedCouponId: idSet.has(s.selectedCouponId!)
                        ? null
                        : s.selectedCouponId,
                    selectedCoupon: idSet.has(s.selectedCouponId!)
                        ? null
                        : s.selectedCoupon,
                    selectedIds: new Set(),
                    meta: s.meta
                        ? { ...s.meta, total: s.meta.total - ids.length }
                        : null,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({
                    mutationError: e?.message ?? "Bulk delete failed",
                    mutating: false,
                });
                return false;
            }
        },

        // ── Selection ──────────────────────────────────────────────────────────

        toggleSelect: (id) =>
            set((s) => {
                const next = new Set(s.selectedIds);
                next.has(id) ? next.delete(id) : next.add(id);
                return { selectedIds: next };
            }),

        selectAll: () =>
            set((s) => ({ selectedIds: new Set(s.coupons.map((c) => c.id)) })),

        clearSelection: () => set({ selectedIds: new Set() }),

        reset: () => set(initialState),
    })
);