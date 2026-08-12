import { useState, useEffect, useCallback } from 'react';
import type { Category } from 'wle-core';
import { getCategories } from '~/api/http-requests';
import { useCategoryStore } from '~/hooks/use-category-store';

interface UseCategoriesReturn {
    data: Category[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
    const { categories, setCategories } = useCategoryStore();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getCategories();
            if (response.error) throw response.error;
            setCategories(response.data?.categories ?? []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data: categories, isLoading, error, refetch: fetchCategories };
};