import type { Transaction } from "wle-core";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TransactionsQueryParams, TransactionsResponse } from "~/types/transactions";

type SortConfig = {
    by: TransactionsQueryParams["sort_by"];
    dir: TransactionsQueryParams["sort_dir"];
};

type Pagination = {
    page: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
};

type TransactionsListState = {
    // Data
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;

    // Filters
    filters: TransactionsQueryParams;

    // Sort
    sort: SortConfig;

    // Pagination
    pagination: Pagination;

    // Row selection (for bulk actions)
    selectedUuids: Set<string>;

    // UI state
    filtersOpen: boolean;
};

type TransactionsListActions = {
    setTransactions: (data: TransactionsResponse["transactions"]) => void;
    setLoading: (v: boolean) => void;
    setError: (e: string | null) => void;

    setFilter: <K extends keyof TransactionsQueryParams>(
        key: K,
        value: TransactionsQueryParams[K]
    ) => void;
    resetFilters: () => void;

    setSort: (sort: SortConfig) => void;
    setPage: (page: number) => void;

    toggleRow: (uuid: string) => void;
    toggleAllRows: () => void;
    clearSelection: () => void;

    toggleFiltersOpen: () => void;
    // Derived helper
    getQueryParams: () => TransactionsQueryParams;
};

const DEFAULT_FILTERS: TransactionsQueryParams = {
    page: 1,
    per_page: 25,
};

export const useTransactionsListStore = create<
    TransactionsListState & TransactionsListActions
>()(
    immer((set, get) => ({
        transactions: [],
        isLoading: false,
        error: null,
        filters: { ...DEFAULT_FILTERS },
        sort: { by: "created_at", dir: "desc" },
        pagination: { page: 1, lastPage: 1, perPage: 25, total: 0, from: 0, to: 0 },
        selectedUuids: new Set(),
        filtersOpen: false,

        setTransactions: (data) =>
            set((s) => {
                s.transactions = data.data;
                s.pagination = {
                    page: data.current_page,
                    lastPage: data.last_page,
                    perPage: data.per_page,
                    total: data.total,
                    from: data.from,
                    to: data.to,
                };
            }),

        setLoading: (v) => set((s) => { s.isLoading = v; }),
        setError: (e) => set((s) => { s.error = e; }),

        setFilter: (key, value) =>
            set((s) => {
                (s.filters as any)[key] = value;
                s.filters.page = 1; // reset to first page on any filter change
            }),

        resetFilters: () =>
            set((s) => {
                s.filters = { ...DEFAULT_FILTERS };
            }),

        setSort: (sort) =>
            set((s) => {
                s.sort = sort;
                s.filters.sort_by = sort.by;
                s.filters.sort_dir = sort.dir;
                s.filters.page = 1;
            }),

        setPage: (page) =>
            set((s) => {
                s.filters.page = page;
            }),

        toggleRow: (uuid) =>
            set((s) => {
                if (s.selectedUuids.has(uuid)) {
                    s.selectedUuids.delete(uuid);
                } else {
                    s.selectedUuids.add(uuid);
                }
            }),

        toggleAllRows: () =>
            set((s) => {
                const allUuids: string[] = s.transactions.map((t: Transaction) => t.uuid);
                const allSelected = allUuids.every((u) => s.selectedUuids.has(u));
                if (allSelected) {
                    allUuids.forEach((u) => s.selectedUuids.delete(u));
                } else {
                    allUuids.forEach((u) => s.selectedUuids.add(u));
                }
            }),

        clearSelection: () =>
            set((s) => {
                s.selectedUuids = new Set();
            }),

        toggleFiltersOpen: () =>
            set((s) => {
                s.filtersOpen = !s.filtersOpen;
            }),

        getQueryParams: () => {
            const { filters, sort } = get();
            return { ...filters, sort_by: sort.by, sort_dir: sort.dir };
        },
    }))
);