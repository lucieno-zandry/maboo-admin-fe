import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '~/api/http-requests';
import { useProductFilterStore } from '../stores/use-product-filter-store';
import type { PaginatedResponse } from '~/api/app-fetch';
import useDebounce from '~/hooks/use-debounce';
import useProductsStore from '../stores/use-products-store';
import type { Product } from 'wle-core';

interface UseProductsReturn {
    data: PaginatedResponse<Product> | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useProducts = (): UseProductsReturn => {
    const { filters, page, limit } = useProductFilterStore();
    const { data, setData } = useProductsStore();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const debouncedFilters = useDebounce(filters, 500);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                ...debouncedFilters,
                page,
                limit,
            };
            const response = await getProducts(params);
            if (response.error) throw response.error;
            setData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch products'));
        } finally {
            setIsLoading(false);
        }
    }, [debouncedFilters, page, limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { data, isLoading, error, refetch: fetchProducts };
};