import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCategoryStore } from '~/hooks/use-category-store';
import { getProducts } from '~/api/http-requests';
import useDebounce from '~/hooks/use-debounce';
import { useProductListStore } from '~/hooks/use-product-list-store';
import type { Product } from 'wle-core';

const PAGE_SIZE = 10;

export type SortOption = {
  order_by: 'created_at' | 'title';
  direction: 'ASC' | 'DESC';
  label: string;
};

export const SORT_OPTIONS: SortOption[] = [
  { order_by: 'created_at', direction: 'DESC', label: 'Newest first' },
  { order_by: 'created_at', direction: 'ASC', label: 'Oldest first' },
  { order_by: 'title', direction: 'ASC', label: 'Name A → Z' },
  { order_by: 'title', direction: 'DESC', label: 'Name Z → A' },
];

type LocalFilters = {
  categoryId: number | null;
  minPrice: string;
  maxPrice: string;
  sortKey: string; // e.g., "created_at:DESC"
};

const DEFAULT_LOCAL_FILTERS: LocalFilters = {
  categoryId: null,
  minPrice: '',
  maxPrice: '',
  sortKey: 'created_at:DESC',
};

export function useProductList() {
  const { categories } = useCategoryStore();

  // Store state
  const storeProducts = useProductListStore((state) => state.products);
  const storeTotal = useProductListStore((state) => state.total);
  const storeLoading = useProductListStore((state) => state.loading);
  const storeError = useProductListStore((state) => state.error);
  const storeFilters = useProductListStore((state) => state.filters);
  const setStoreFilters = useProductListStore((state) => state.setFilters);
  const fetchProducts = useProductListStore((state) => state.fetchProducts);
  const resetStore = useProductListStore((state) => state.reset);

  // Local filter inputs (strings for controlled inputs)
  const [localFilters, setLocalFilters] = useState<LocalFilters>(DEFAULT_LOCAL_FILTERS);
  const debouncedMinPrice = useDebounce(localFilters.minPrice, 400);
  const debouncedMaxPrice = useDebounce(localFilters.maxPrice, 400);

  // Command overlay state
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [commandResults, setCommandResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedCommandSearch = useDebounce(commandSearch, 300);

  const parseSortKey = (sortKey: string) => {
    const [order_by, direction] = sortKey.split(':') as ['created_at' | 'title', 'ASC' | 'DESC'];
    return { order_by, direction };
  };

  // Sync local filters (after debounce) to the store, but only if they actually changed.
  // This effect does NOT run on mount if local filters already match store defaults.
  useEffect(() => {
    const { order_by, direction } = parseSortKey(localFilters.sortKey);
    const newFilterValues = {
      category_id: localFilters.categoryId ?? undefined,
      min_price: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
      max_price: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
      order_by,
      direction,
    };

    // Compare only the fields we control (skip page, limit, etc.)
    const hasFilterChanged = (
      newFilterValues.category_id !== storeFilters.category_id ||
      newFilterValues.min_price !== storeFilters.min_price ||
      newFilterValues.max_price !== storeFilters.max_price ||
      newFilterValues.order_by !== storeFilters.order_by ||
      newFilterValues.direction !== storeFilters.direction
    );

    if (hasFilterChanged) {
      // When filters change, reset to page 1
      setStoreFilters({
        ...newFilterValues,
        page: 1,
      });
    }
  }, [
    localFilters.categoryId,
    localFilters.sortKey,
    debouncedMinPrice,
    debouncedMaxPrice,
    storeFilters, // included to compare with current values
    setStoreFilters,
  ]);

  // Fetch products whenever store filters change
  useEffect(() => {
    fetchProducts();
  }, [storeFilters, fetchProducts]);

  // Command search (quick lookup, not affecting main list)
  useEffect(() => {
    if (!commandOpen) return;
    if (!debouncedCommandSearch.trim()) {
      setCommandResults([]);
      return;
    }
    setIsSearching(true);
    getProducts({ search: debouncedCommandSearch, limit: 10 })
      .then((res) => setCommandResults(res.data?.data || []))
      .finally(() => setIsSearching(false));
  }, [debouncedCommandSearch, commandOpen]);

  const closeCommand = useCallback(() => {
    setCommandOpen(false);
    setCommandSearch('');
    setCommandResults([]);
  }, []);

  // Update local filters (called by filter controls)
  const setFilters = useCallback((patch: Partial<LocalFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    // Reset store first, then local. This ensures the sync effect sees store already at defaults
    // and doesn't trigger an extra filter update.
    resetStore();
    setLocalFilters(DEFAULT_LOCAL_FILTERS);
  }, [resetStore]);

  const setPage = useCallback((page: number) => {
    setStoreFilters({ page });
  }, [setStoreFilters]);

  const totalPages = Math.max(1, Math.ceil(storeTotal / PAGE_SIZE));

  const hasActiveFilters = useMemo(
    () =>
      localFilters.categoryId !== null ||
      localFilters.minPrice !== '' ||
      localFilters.maxPrice !== '' ||
      localFilters.sortKey !== DEFAULT_LOCAL_FILTERS.sortKey,
    [localFilters]
  );

  return {
    // Data
    products: storeProducts,
    isLoading: storeLoading,
    error: storeError,
    total: storeTotal,

    // Pagination
    page: storeFilters.page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,

    // Filters
    filters: localFilters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    categories,

    // Command overlay
    commandOpen,
    setCommandOpen,
    closeCommand,
    commandSearch,
    setCommandSearch,
    commandResults,
    isSearching,
  };
}