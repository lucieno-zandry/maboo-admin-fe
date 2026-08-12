// ~/components/shipments/ShipmentsFilters.tsx
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { useState } from 'react';
import type { ShipmentsFilters as FiltersType } from '~/types/shipments';
import { useShipmentsStore } from '~/hooks/use-shipments-store';
import type { Shipment } from 'wle-core';

// --- DUMB COMPONENT (View) ---
type ShipmentsFiltersViewProps = {
    filters: FiltersType;
    onFilterChange: (filters: Partial<FiltersType>) => void;
    onReset: () => void;
    fromDateOpen?: boolean;
    toDateOpen?: boolean;
    onFromDateOpenChange?: (open: boolean) => void;
    onToDateOpenChange?: (open: boolean) => void;
};

export function ShipmentsFiltersView({
    filters,
    onFilterChange,
    onReset,
    fromDateOpen,
    toDateOpen,
    onFromDateOpenChange,
    onToDateOpenChange
}: ShipmentsFiltersViewProps) {
    const hasActiveFilters = filters.search || (filters.status && filters.status !== 'all') || filters.fromDate || filters.toDate;

    return (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Search - takes more space */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search orders, tracking..."
                        value={filters.search || ''}
                        onChange={(e) => onFilterChange({ search: e.target.value })}
                        className="pl-9 bg-zinc-800/50 border-zinc-700 focus-visible:ring-zinc-600 h-10"
                    />
                </div>

                {/* Status dropdown */}
                <div className="w-full lg:w-40">
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value: Shipment['status']) => onFilterChange({ status: value })}
                    >
                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 h-10">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date range with popovers */}
                <div className="flex items-center gap-2">
                    <Popover open={fromDateOpen} onOpenChange={onFromDateOpenChange}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full lg:w-36 justify-start text-left font-normal bg-zinc-800/50 border-zinc-700 h-10",
                                    !filters.fromDate && "text-zinc-500"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.fromDate ? format(new Date(filters.fromDate), 'PP') : 'From date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                            <Calendar
                                mode="single"
                                selected={filters.fromDate ? new Date(filters.fromDate) : undefined}
                                onSelect={(date: Date) => onFilterChange({ fromDate: date?.toISOString().split('T')[0] })}
                                className="bg-zinc-900"
                                autoFocus
                                required
                            />
                        </PopoverContent>
                    </Popover>

                    <span className="text-zinc-600">–</span>

                    <Popover open={toDateOpen} onOpenChange={onToDateOpenChange}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full lg:w-36 justify-start text-left font-normal bg-zinc-800/50 border-zinc-700 h-10",
                                    !filters.toDate && "text-zinc-500"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.toDate ? format(new Date(filters.toDate), 'PP') : 'To date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                            <Calendar
                                mode="single"
                                selected={filters.toDate ? new Date(filters.toDate) : undefined}
                                onSelect={(date: Date) => onFilterChange({ toDate: date?.toISOString().split('T')[0] })}
                                className="bg-zinc-900"
                                autoFocus
                                required
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Reset button - appears only when filters active */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="text-zinc-400 hover:text-zinc-300 h-10 px-3"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}

// --- SMART COMPONENT (Container) ---
export function ShipmentsFilters() {
    const filters = useShipmentsStore((state) => state.filters);
    const setFilters = useShipmentsStore((state) => state.setFilters);
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

    const handleReset = () => {
        setFilters({ search: '', status: 'all', fromDate: undefined, toDate: undefined });
    };

    return (
        <ShipmentsFiltersView
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleReset}
            fromDateOpen={fromDateOpen}
            toDateOpen={toDateOpen}
            onFromDateOpenChange={setFromDateOpen}
            onToDateOpenChange={setToDateOpen}
        />
    );
}