import type { Order } from 'wle-core';
import { create } from 'zustand';

interface OrderDetailStore {
    order: Order | null;
    loading: boolean;
    error: string | null;
    setOrder: (order: Order) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateOrder: (updates: Partial<Order>) => void; // optimistic updates
}

export const useOrderDetailStore = create<OrderDetailStore>((set) => ({
    order: null,
    loading: false,
    error: null,
    setOrder: (order) => set({ order }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    updateOrder: (updates) => set((state) => ({
        order: state.order ? { ...state.order, ...updates } : null,
    })),
}));