import { useState, useEffect, useCallback } from 'react';
import { getProduct } from '~/api/http-requests';
import useProductStore from '../stores/use-product-store';
import type { Product } from 'wle-core';

interface UseProductReturn {
    data: Product | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useProduct = (slug?: string): UseProductReturn => {
    const { setProduct, product } = useProductStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchProduct = useCallback(async () => {
        if (slug && slug === '') {
            setProduct(undefined);
            setIsLoading(false);
            setError(null);
        }

        if (!slug) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await getProduct(slug);
            if (response.error) throw response.error;
            setProduct(response.data?.product);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch product'));
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return { data: product, isLoading, error, refetch: fetchProduct };
};