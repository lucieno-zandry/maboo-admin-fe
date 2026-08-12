import type { Shipment } from 'wle-core';
import { create } from 'zustand';
import { fetchShipments } from '~/api/http-requests';
import type { FetchShipmentsParams, ShipmentsFilters } from '~/types/shipments';

interface ShipmentsStore {
    // Data
    shipments: Shipment[];
    pagination: {
        currentPage: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
    filters: ShipmentsFilters;
    sortBy?: keyof Shipment;
    sortOrder?: 'asc' | 'desc';

    // Update
    updatingShipment: Shipment | null;
    setUpdatingShipment: (shipment: Shipment | null) => void;

    // Cancel
    cancellingShipment: Shipment | null;
    setCancellingShipment: (shipment: Shipment | null) => void;

    // UI state
    loading: boolean;
    error: string | null;

    // Internal state setters (without fetch)
    _setFilters: (filters: Partial<ShipmentsFilters>) => void;
    _setPage: (page: number) => void;
    _setPerPage: (perPage: number) => void;
    _setSorting: (sortBy?: keyof Shipment, sortOrder?: 'asc' | 'desc') => void;

    // Public actions (with fetch)
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    setFilters: (filters: Partial<ShipmentsFilters>) => void;
    setSorting: (sortBy: keyof Shipment, sortOrder?: 'asc' | 'desc') => void;
    fetchShipments: () => Promise<void>;
}

export const useShipmentsStore = create<ShipmentsStore>((set, get) => ({
    shipments: [],
    pagination: {
        currentPage: 1,
        perPage: 10,
        total: 0,
        totalPages: 1,
    },
    filters: {
        status: 'all',
        search: '',
    },
    loading: false,
    error: null,

    // Internal setters (no fetch)
    _setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
        }));
    },
    _setPage: (page) => {
        set((state) => ({
            pagination: { ...state.pagination, currentPage: page },
        }));
    },
    _setPerPage: (perPage) => {
        set((state) => ({
            pagination: { ...state.pagination, perPage },
        }));
    },
    _setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
    },

    // Public actions (with fetch)
    setPage: (page) => {
        get()._setPage(page);
        get().fetchShipments();
    },

    setPerPage: (perPage) => {
        get()._setPerPage(perPage);
        get()._setPage(1); // reset to first page when changing per page
        get().fetchShipments();
    },

    setFilters: (filters) => {
        get()._setFilters(filters);
        get()._setPage(1); // reset to first page when changing filters
        get().fetchShipments();
    },

    setSorting: (sortBy, sortOrder = 'asc') => {
        get()._setSorting(sortBy, sortOrder);
        get()._setPage(1); // reset to first page when changing sort
        get().fetchShipments();
    },

    fetchShipments: async () => {
        const { pagination, filters, sortBy, sortOrder } = get();
        set({ loading: true, error: null });

        try {
            const params: FetchShipmentsParams = {
                page: pagination.currentPage,
                perPage: pagination.perPage,
                filters,
                sortBy,
                sortOrder,
                with: ['order', 'order.user'],
            };

            const response = await fetchShipments(params);
            const { data, total, last_page, current_page, per_page } = response.data!;

            set({
                shipments: data,
                pagination: {
                    currentPage: current_page,
                    perPage: per_page,
                    total: total,
                    totalPages: last_page,
                },
                loading: false,
            });
        } catch (err: any) {
            set({ error: err?.message ?? 'Failed to load shipments', loading: false });
        }
    },

    updatingShipment: null,
    setUpdatingShipment: (shipment) => set({ updatingShipment: shipment }),
    cancellingShipment: null,
    setCancellingShipment: (shipment) => set({ cancellingShipment: shipment }),
}));