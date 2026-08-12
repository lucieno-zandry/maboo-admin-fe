import type { Order } from 'wle-core';
import { create } from 'zustand';
import { fetchOrders } from '~/api/http-requests';
import type { OrdersQueryParams } from '~/types/orders';

interface OrdersStore {
    orders: Order[];
    pagination: {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    };
    loading: boolean;
    error: string | null;
    fetchOrders: (params: OrdersQueryParams) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
    orders: [],
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 10,
    },
    loading: false,
    error: null,
    fetchOrders: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await fetchOrders(params);
            set({
                orders: response.data?.data || [],
                pagination: {
                    currentPage: response.data?.current_page || 1,
                    lastPage: response.data?.last_page || 1,
                    total: response.data?.total || 0,
                    perPage: response.data?.per_page || 10,
                },
                loading: false,
            });
        } catch (err) {
            set({ error: 'Failed to load orders. Please try again.', loading: false });
            console.error(err);
        }
    },
}));