import type { Product } from 'wle-core';
import { create } from 'zustand';
import { getProducts } from '~/api/http-requests';

export interface ProductFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  order_by?: 'created_at' | 'title';
  direction?: 'ASC' | 'DESC';
  page: number;
  limit: number;
}

interface ProductListStore {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  setFilters: (filters: Partial<ProductFilters>) => void;
  fetchProducts: () => Promise<void>;
  reset: () => void;
}

const defaultFilters: ProductFilters = {
  page: 1,
  limit: 10,
  order_by: 'created_at',
  direction: 'DESC',
};

export const useProductListStore = create<ProductListStore>((set, get) => ({
  products: [],
  total: 0,
  loading: false,
  error: null,
  filters: defaultFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  fetchProducts: async () => {
    const { filters } = get();
    set({ loading: true, error: null });
    try {
      const response = await getProducts({
        ...filters,
        with: ['category', 'images', 'variants'],
      });
      set({
        products: response.data?.data || [],
        total: response.data?.total || 0,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  reset: () => set({
    products: [],
    total: 0,
    filters: defaultFilters,
    error: null,
    loading: false,
  }),
}));

// Hook for refetching anywhere
export const useRefetchProducts = () => {
  const fetchProducts = useProductListStore((state) => state.fetchProducts);
  return fetchProducts;
};