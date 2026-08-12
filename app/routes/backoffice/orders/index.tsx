import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import OrdersHeader from "~/components/orders/orders-header";
import OrdersFilters from "~/components/orders/orders-filters";
import OrdersTable from "~/components/orders/orders-table";
import OrdersPagination from "~/components/orders/orders-pagination";
import type { OrdersQueryParams } from "~/types/orders";
import { useOrdersStore } from "~/hooks/use-orders-store";
import OrdersFilterDialog, { DEFAULT_MAX_TOTAL } from "~/components/orders/orders-filter-dialog";
import OrdersBulkActions from "~/components/orders/orders-bulk-actions";
import toOrderQueryParams from "~/lib/to-order-query-params";
import UpdateShipmentDialog from "~/components/orders/update-shipment-sheet";
import type { Order } from "wle-core";

export default function () {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    const { fetchOrders, error } = useOrdersStore();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);

    const toggleSelect = (uuid: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(uuid)) {
                next.delete(uuid);
            } else {
                next.add(uuid);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        setSelectedIds(prev => {
            if (prev.size === orders.length) {
                return new Set(); // deselect all
            } else {
                return new Set(orders.map(o => o.uuid)); // select all on current page
            }
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    // Get orders from store for select-all
    const { orders } = useOrdersStore();
    const allIdsOnPage = orders.map(o => o.uuid);


    const searchParamsString = searchParams.toString();

    useEffect(() => {
        const params = new URLSearchParams(searchParamsString);
        fetchOrders(toOrderQueryParams(params));
    }, [searchParamsString, fetchOrders]);

    // Helper to update search params
    const updateParams = useCallback((updates: Partial<OrdersQueryParams>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }
        });
        // Reset to page 1 when filters change
        if (updates.search !== undefined || updates.date_from !== undefined ||
            updates.date_to !== undefined || updates.payment_status !== undefined ||
            updates.shipment_status !== undefined) {
            newParams.set("page", "1");
        }
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Sorting handler
    const handleSort = (field: string) => {
        const currentSort = searchParams.get("sort") || "";
        let newSort = field;
        if (currentSort === field) {
            newSort = `-${field}`;
        } else if (currentSort === `-${field}`) {
            newSort = "";
        }
        updateParams({ sort: newSort || undefined });
    };

    // Page change handler
    const handlePageChange = (page: number) => {
        updateParams({ page });
    };

    const currentSort = searchParams.get("sort") || "-created_at";

    const handleShipmentsUpdateSuccess = async () => {
        await fetchOrders(toOrderQueryParams(searchParams));
    }

    return (
        <div className="p-6 space-y-6 bg-background/80 backdrop-blur-md rounded-2xl">
            <OrdersHeader />
            <OrdersFilters updateParams={updateParams} searchParams={searchParams} onFilterClick={() => setFilterDialogOpen(true)} />
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            <OrdersBulkActions
                selectedIds={selectedIds}
                onClearSelection={clearSelection}
            />
            <OrdersTable
                currentSort={currentSort}
                onSort={handleSort}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                allIdsOnPage={allIdsOnPage}
                onUpdateShipmentClick={setUpdatingOrder}
            />
            <OrdersPagination onPageChange={handlePageChange} />
            <OrdersFilterDialog
                open={filterDialogOpen}
                onOpenChange={setFilterDialogOpen}
                searchParams={searchParams}
                updateParams={updateParams}
            />
            <UpdateShipmentDialog
                open={!!updatingOrder}
                onOpenChange={(open) => !open && setUpdatingOrder(null)}
                order={updatingOrder}
                onSuccess={handleShipmentsUpdateSuccess}
            />
        </div>
    );
}