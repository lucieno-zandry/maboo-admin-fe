// ~/stores/promotions-store.ts
import type { Promotion } from "wle-core";
import { create } from "zustand";
import {
    fetchPromotions,
    showPromotion,
    createPromotion,
    updatePromotion,
    deletePromotion,
    bulkDeletePromotions,
    togglePromotionActive,
    detachPromotionFromVariant,
} from "~/api/http-requests";
import type { CreatePromotionData, PromotionsQueryParams, UpdatePromotionData } from "~/types/promotions";

// ─── Types ────────────────────────────────────────────────────────────────────

type PromotionsMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

type PromotionsState = {
    // List
    promotions: Promotion[];
    meta: PromotionsMeta | null;
    listLoading: boolean;
    listError: string | null;

    // Detail
    selectedPromotionId: number | null;
    selectedPromotion: Promotion | null;
    detailLoading: boolean;
    detailError: string | null;

    // Query params
    params: PromotionsQueryParams;

    // Multi-select
    selectedIds: Set<number>;

    // Mutation
    mutating: boolean;
    mutationError: string | null;
};

type PromotionsActions = {
    loadPromotions: (params?: PromotionsQueryParams) => Promise<void>;
    setParams: (params: Partial<PromotionsQueryParams>) => void;

    selectPromotion: (id: number | null) => void;
    loadDetail: (id: number) => Promise<void>;
    refreshDetail: () => Promise<void>;

    createPromotion: (data: CreatePromotionData) => Promise<Promotion | null>;
    updatePromotion: (
        id: number,
        data: UpdatePromotionData
    ) => Promise<Promotion | null>;
    toggleActive: (id: number, is_active: boolean) => Promise<boolean>;
    deletePromotion: (id: number) => Promise<boolean>;
    bulkDelete: (ids: number[]) => Promise<boolean>;
    detachVariant: (promotionId: number, variantId: number) => Promise<boolean>;

    toggleSelect: (id: number) => void;
    selectAll: () => void;
    clearSelection: () => void;

    reset: () => void;
};

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: PromotionsState = {
    promotions: [],
    meta: null,
    listLoading: false,
    listError: null,
    selectedPromotionId: null,
    selectedPromotion: null,
    detailLoading: false,
    detailError: null,
    params: {
        page: 1,
        per_page: 20,
        sort_by: "priority",
        sort_order: "asc",
    },
    selectedIds: new Set(),
    mutating: false,
    mutationError: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePromotionsStore = create<PromotionsState & PromotionsActions>(
    (set, get) => ({
        ...initialState,

        setParams: (params) =>
            set((s) => ({ params: { ...s.params, ...params } })),

        loadPromotions: async (overrides?) => {
            const params = { ...get().params, ...overrides };
            set({ listLoading: true, listError: null });
            try {
                const { data } = await fetchPromotions(params);
                set({
                    promotions: data!.data,
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
                    listError: e?.message ?? "Failed to load promotions",
                    listLoading: false,
                });
            }
        },

        selectPromotion: (id) => {
            set({ selectedPromotionId: id, selectedPromotion: null, detailError: null });
            if (id !== null) get().loadDetail(id);
        },

        loadDetail: async (id) => {
            set({ detailLoading: true, detailError: null });
            try {
                const res = await showPromotion(id);
                set({ selectedPromotion: res.data?.promotion, detailLoading: false });
            } catch (e: any) {
                set({
                    detailError: e?.message ?? "Failed to load promotion details",
                    detailLoading: false,
                });
            }
        },

        refreshDetail: async () => {
            const id = get().selectedPromotionId;
            if (id !== null) await get().loadDetail(id);
        },

        createPromotion: async (data) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await createPromotion(data);
                set((s) => ({
                    promotions: [res.data!.promotion, ...s.promotions],
                    meta: s.meta ? { ...s.meta, total: s.meta.total + 1 } : null,
                    mutating: false,
                }));
                return res.data!.promotion;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to create promotion", mutating: false });
                return null;
            }
        },

        updatePromotion: async (id, data) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await updatePromotion(id, data);
                const updated = res.data!.promotion;
                set((s) => ({
                    promotions: s.promotions.map((p) =>
                        p.id === id ? { ...p, ...updated } : p
                    ),
                    selectedPromotion:
                        s.selectedPromotionId === id
                            ? { ...s.selectedPromotion!, ...updated }
                            : s.selectedPromotion,
                    mutating: false,
                }));
                return updated;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to update promotion", mutating: false });
                return null;
            }
        },

        toggleActive: async (id, is_active) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await togglePromotionActive(id, is_active);
                const updated = res.data!.promotion;
                set((s) => ({
                    promotions: s.promotions.map((p) =>
                        p.id === id ? { ...p, ...updated } : p
                    ),
                    selectedPromotion:
                        s.selectedPromotionId === id
                            ? { ...s.selectedPromotion!, ...updated }
                            : s.selectedPromotion,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to toggle promotion", mutating: false });
                return false;
            }
        },

        deletePromotion: async (id) => {
            set({ mutating: true, mutationError: null });
            try {
                await deletePromotion(id);
                set((s) => ({
                    promotions: s.promotions.filter((p) => p.id !== id),
                    selectedPromotionId: s.selectedPromotionId === id ? null : s.selectedPromotionId,
                    selectedPromotion: s.selectedPromotionId === id ? null : s.selectedPromotion,
                    meta: s.meta ? { ...s.meta, total: s.meta.total - 1 } : null,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to delete promotion", mutating: false });
                return false;
            }
        },

        bulkDelete: async (ids) => {
            set({ mutating: true, mutationError: null });
            try {
                await bulkDeletePromotions(ids);
                const idSet = new Set(ids);
                set((s) => ({
                    promotions: s.promotions.filter((p) => !idSet.has(p.id)),
                    selectedPromotionId: idSet.has(s.selectedPromotionId!) ? null : s.selectedPromotionId,
                    selectedPromotion: idSet.has(s.selectedPromotionId!) ? null : s.selectedPromotion,
                    selectedIds: new Set(),
                    meta: s.meta ? { ...s.meta, total: s.meta.total - ids.length } : null,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Bulk delete failed", mutating: false });
                return false;
            }
        },

        detachVariant: async (promotionId, variantId) => {
            set({ mutating: true, mutationError: null });
            try {
                await detachPromotionFromVariant(promotionId, variantId);
                set((s) => ({
                    selectedPromotion: s.selectedPromotion
                        ? {
                            ...s.selectedPromotion,
                            variants: s.selectedPromotion.variants?.filter(
                                (v) => v.id !== variantId
                            ),
                        }
                        : null,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to detach variant", mutating: false });
                return false;
            }
        },

        toggleSelect: (id) =>
            set((s) => {
                const next = new Set(s.selectedIds);
                next.has(id) ? next.delete(id) : next.add(id);
                return { selectedIds: next };
            }),

        selectAll: () =>
            set((s) => ({
                selectedIds: new Set(s.promotions.map((p) => p.id)),
            })),

        clearSelection: () => set({ selectedIds: new Set() }),

        reset: () => set(initialState),
    })
);