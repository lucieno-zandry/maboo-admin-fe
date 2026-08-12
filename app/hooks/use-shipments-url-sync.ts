import { useSearchParams } from 'react-router';
import { useEffect, useRef } from 'react';
import { useShipmentsStore } from './use-shipments-store';
import type { Shipment } from 'wle-core';

export function useShipmentsUrlSync() {
    const [searchParams, setSearchParams] = useSearchParams();
    const store = useShipmentsStore();
    const isUpdatingFromUrl = useRef(false);

    const syncFromUrl = () => {
        isUpdatingFromUrl.current = true;

        // Read params
        const filters = {
            search: searchParams.get('search') || undefined,
            status: (searchParams.get('status') as Shipment['status']) || 'all',
            fromDate: searchParams.get('from_date') || undefined,
            toDate: searchParams.get('to_date') || undefined,
        };
        const page = parseInt(searchParams.get('page') || '1', 10);
        const perPage = parseInt(searchParams.get('per_page') || '10', 10);
        const sortBy = searchParams.get('sort_by') as keyof Shipment | undefined;
        const sortOrder = searchParams.get('sort_order') as 'asc' | 'desc' | undefined;

        // Use internal setters to avoid triggering fetch multiple times
        store._setFilters(filters);
        store._setPage(page);
        store._setPerPage(perPage);
        store._setSorting(sortBy, sortOrder);

        // Then fetch once
        store.fetchShipments();

        isUpdatingFromUrl.current = false;
    };

    // Update URL when store changes (except when we are updating from URL)
    useEffect(() => {
        if (isUpdatingFromUrl.current) return;

        const params = new URLSearchParams();

        if (store.filters.search) params.set('search', store.filters.search);
        if (store.filters.status && store.filters.status !== 'all')
            params.set('status', store.filters.status);
        if (store.filters.fromDate) params.set('from_date', store.filters.fromDate);
        if (store.filters.toDate) params.set('to_date', store.filters.toDate);
        if (store.pagination.currentPage > 1)
            params.set('page', store.pagination.currentPage.toString());
        if (store.pagination.perPage !== 10)
            params.set('per_page', store.pagination.perPage.toString());
        if (store.sortBy) params.set('sort_by', store.sortBy);
        if (store.sortOrder) params.set('sort_order', store.sortOrder);

        setSearchParams(params, { replace: true });
    }, [
        store.filters,
        store.pagination.currentPage,
        store.pagination.perPage,
        store.sortBy,
        store.sortOrder,
        setSearchParams,
    ]);

    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            syncFromUrl();
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    return { syncFromUrl };
}