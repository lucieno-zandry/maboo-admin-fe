// ~/stores/client-codes-store.ts
import type { ClientCode } from "wle-core";
import { create } from "zustand";
import {
    fetchClientCodes,
    showClientCode,
    createClientCode,
    updateClientCode,
    deleteClientCode,
    bulkDeleteClientCodes,
    detachUserFromClientCode,
} from "~/api/http-requests";
import type { ClientCodesQueryParams } from "~/types/client-codes";

// ─── State shape ─────────────────────────────────────────────────────────────

type ClientCodesMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

type ClientCodesState = {
    // List
    codes: ClientCode[];
    meta: ClientCodesMeta | null;
    listLoading: boolean;
    listError: string | null;

    // Detail
    selectedCodeId: number | null;
    selectedCode: ClientCode | null;
    detailLoading: boolean;
    detailError: string | null;

    // Query params
    params: ClientCodesQueryParams;

    // Selection (for bulk ops)
    selectedIds: Set<number>;

    // Mutation state
    mutating: boolean;
    mutationError: string | null;
};

type ClientCodesActions = {
    // List
    loadCodes: (params?: ClientCodesQueryParams) => Promise<void>;
    setParams: (params: Partial<ClientCodesQueryParams>) => void;

    // Detail
    selectCode: (id: number | null) => void;
    loadDetail: (id: number) => Promise<void>;

    // Mutations
    createCode: (data: {
        code: string;
        is_active?: boolean;
        max_uses?: number | null;
    }) => Promise<ClientCode | null>;

    updateCode: (
        id: number,
        data: { code?: string; is_active?: boolean; max_uses?: number | null }
    ) => Promise<ClientCode | null>;

    deleteCode: (id: number) => Promise<boolean>;
    bulkDelete: (ids: number[]) => Promise<boolean>;
    detachUser: (codeId: number, userId: number) => Promise<boolean>;

    // Selection
    toggleSelect: (id: number) => void;
    selectAll: () => void;
    clearSelection: () => void;

    // Reset
    reset: () => void;
};

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: ClientCodesState = {
    codes: [],
    meta: null,
    listLoading: false,
    listError: null,
    selectedCodeId: null,
    selectedCode: null,
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

export const useClientCodesStore = create<ClientCodesState & ClientCodesActions>(
    (set, get) => ({
        ...initialState,

        // ── List ───────────────────────────────────────────────────────────────

        setParams: (params) => {
            set((s) => ({ params: { ...s.params, ...params } }));
        },

        loadCodes: async (overrides?) => {
            const params = { ...get().params, ...overrides };
            set({ listLoading: true, listError: null });
            try {
                const { data } = await fetchClientCodes(params);
                set({
                    codes: data!.data,
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
                set({ listError: e?.message ?? "Failed to load client codes", listLoading: false });
            }
        },

        // ── Detail ─────────────────────────────────────────────────────────────

        selectCode: (id) => {
            set({ selectedCodeId: id, selectedCode: null, detailError: null });
            if (id !== null) get().loadDetail(id);
        },

        loadDetail: async (id) => {
            set({ detailLoading: true, detailError: null });
            try {
                const res = await showClientCode(id);
                set({ selectedCode: res.data?.client_code, detailLoading: false });
            } catch (e: any) {
                set({ detailError: e?.message ?? "Failed to load details", detailLoading: false });
            }
        },

        // ── Mutations ──────────────────────────────────────────────────────────

        createCode: async (data) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await createClientCode(data);
                // Prepend to list
                set((s) => ({
                    codes: [res.data!.client_code, ...s.codes],
                    mutating: false,
                    meta: s.meta ? { ...s.meta, total: s.meta.total + 1 } : null,
                }));
                return res.data!.client_code;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to create client code", mutating: false });
                return null;
            }
        },

        updateCode: async (id, data) => {
            set({ mutating: true, mutationError: null });
            try {
                const res = await updateClientCode(id, data);
                const updated = res.data!.client_code;
                set((s) => ({
                    codes: s.codes.map((c) => (c.id === id ? { ...c, ...updated } : c)),
                    selectedCode:
                        s.selectedCodeId === id
                            ? { ...s.selectedCode!, ...updated }
                            : s.selectedCode,
                    mutating: false,
                }));
                return updated;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to update client code", mutating: false });
                return null;
            }
        },

        deleteCode: async (id) => {
            set({ mutating: true, mutationError: null });
            try {
                await deleteClientCode(id);
                set((s) => ({
                    codes: s.codes.filter((c) => c.id !== id),
                    selectedCodeId: s.selectedCodeId === id ? null : s.selectedCodeId,
                    selectedCode: s.selectedCodeId === id ? null : s.selectedCode,
                    mutating: false,
                    meta: s.meta ? { ...s.meta, total: s.meta.total - 1 } : null,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to delete client code", mutating: false });
                return false;
            }
        },

        bulkDelete: async (ids) => {
            set({ mutating: true, mutationError: null });
            try {
                await bulkDeleteClientCodes(ids);
                const idSet = new Set(ids);
                set((s) => ({
                    codes: s.codes.filter((c) => !idSet.has(c.id)),
                    selectedCodeId: idSet.has(s.selectedCodeId!) ? null : s.selectedCodeId,
                    selectedCode: idSet.has(s.selectedCodeId!) ? null : s.selectedCode,
                    selectedIds: new Set(),
                    mutating: false,
                    meta: s.meta
                        ? { ...s.meta, total: s.meta.total - ids.length }
                        : null,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Bulk delete failed", mutating: false });
                return false;
            }
        },

        detachUser: async (codeId, userId) => {
            set({ mutating: true, mutationError: null });
            try {
                await detachUserFromClientCode(codeId, userId);
                set((s) => ({
                    selectedCode: s.selectedCode
                        ? {
                            ...s.selectedCode,
                            users: s.selectedCode.users?.filter((u) => u.id !== userId),
                        }
                        : null,
                    mutating: false,
                }));
                return true;
            } catch (e: any) {
                set({ mutationError: e?.message ?? "Failed to detach user", mutating: false });
                return false;
            }
        },

        // ── Selection ──────────────────────────────────────────────────────────

        toggleSelect: (id) => {
            set((s) => {
                const next = new Set(s.selectedIds);
                next.has(id) ? next.delete(id) : next.add(id);
                return { selectedIds: next };
            });
        },

        selectAll: () => {
            set((s) => ({ selectedIds: new Set(s.codes.map((c) => c.id)) }));
        },

        clearSelection: () => set({ selectedIds: new Set() }),

        // ── Reset ──────────────────────────────────────────────────────────────

        reset: () => set(initialState),
    })
);