import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Filter, Search } from "lucide-react";
import type { OrdersQueryParams } from "~/types/orders";
import useDebounce from "~/hooks/use-debounce";
import { Button } from "wle-ui-package";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

export type OrdersFiltersViewProps = {
    search: string;
    dateFrom: string;
    dateTo: string;
    paymentStatus: string;
    shipmentStatus: string;
    onSearchChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onPaymentStatusChange: (value: string) => void;
    onShipmentStatusChange: (value: string) => void;
    onFilterClick: () => void;
    activeFilterCount: number;
};

export function OrdersFiltersView({
    search,
    shipmentStatus,
    onSearchChange,
    onShipmentStatusChange,
    onFilterClick,
    activeFilterCount // New prop: total active filters from URL
}: OrdersFiltersViewProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Tabs
                    value={shipmentStatus || "all"}
                    onValueChange={onShipmentStatusChange}
                    className="w-auto"
                >
                    <TabsList className="bg-muted/50 p-1 rounded-full">
                        <TabsTrigger value="all" className="rounded-full px-6">All</TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-full px-6 text-yellow-600">Pending</TabsTrigger>
                        <TabsTrigger value="processing" className="rounded-full px-6 text-blue-600">Processing</TabsTrigger>
                        <TabsTrigger value="shipped" className="rounded-full px-6 text-green-600">Shipped</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search orders..."
                            className="pl-9 rounded-full bg-muted/30 border-none focus-visible:ring-1"
                        />
                    </div>
                    <Button variant="outline" className="rounded-full gap-2 relative" onClick={onFilterClick}>
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export type OrdersFiltersProps = {
    updateParams: (updates: Partial<OrdersQueryParams>) => void;
    searchParams: URLSearchParams;
    onFilterClick: () => void;
};

export default function OrdersFilters({ updateParams, searchParams, onFilterClick }: OrdersFiltersProps) {
    const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(searchInput, 500);

    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";
    const paymentStatus = searchParams.get("payment_status") || "all";
    const shipmentStatus = searchParams.get("shipment_status") || "all";

    // Only update URL if the debounced value actually changed
    useEffect(() => {
        const currentSearch = searchParams.get("search") || "";
        if (debouncedSearch !== currentSearch) {
            updateParams({ search: debouncedSearch || undefined });
        }
    }, [debouncedSearch, searchParams, updateParams]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    const handleDateFromChange = (value: string) => {
        updateParams({ date_from: value });
    };

    const handleDateToChange = (value: string) => {
        updateParams({ date_to: value });
    };

    const handlePaymentStatusChange = (value: string) => {
        updateParams({ payment_status: value === "all" ? "" : value });
    };

    const handleShipmentStatusChange = (value: string) => {
        updateParams({ shipment_status: value === "all" ? "" : value });
    };



    return (
        <OrdersFiltersView
            search={searchInput}
            dateFrom={dateFrom}
            dateTo={dateTo}
            paymentStatus={paymentStatus}
            shipmentStatus={shipmentStatus}
            onSearchChange={handleSearchChange}
            onDateFromChange={handleDateFromChange}
            onDateToChange={handleDateToChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onShipmentStatusChange={handleShipmentStatusChange}
            onFilterClick={onFilterClick}
            activeFilterCount={searchParams.size - 1}
        />
    );
}