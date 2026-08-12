// ~/components/coupons/coupon-list-panel.tsx
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { CouponListItem } from "./coupon-list-item";
import { CouponBulkBar } from "./coupon-bulk-bar";
import type { Coupon } from "wle-core";

export type CouponListPanelProps = {
  coupons: Coupon[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  } | null;
  loading: boolean;

  search: string;
  onSearchChange: (v: string) => void;

  filterStatus: "all" | "active" | "inactive" | "expired";
  onFilterStatusChange: (v: "all" | "active" | "inactive" | "expired") => void;

  filterType: "all" | "PERCENTAGE" | "FIXED_AMOUNT";
  onFilterTypeChange: (v: "all" | "PERCENTAGE" | "FIXED_AMOUNT") => void;

  selectedCouponId: number | null;
  onSelectCoupon: (id: number) => void;

  selectedIds: Set<number>;
  onToggleCheckbox: (id: number, e: React.MouseEvent) => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;

  onEdit: (coupon: Coupon, e: React.MouseEvent) => void;
  onDelete: (coupon: Coupon, e: React.MouseEvent) => void;

  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onCreateOpen: () => void;
};

export function CouponListPanel({
  coupons,
  meta,
  loading,
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterType,
  onFilterTypeChange,
  selectedCouponId,
  onSelectCoupon,
  selectedIds,
  onToggleCheckbox,
  onClearSelection,
  onBulkDelete,
  onEdit,
  onDelete,
  onPageChange,
  onRefresh,
  onCreateOpen,
}: CouponListPanelProps) {
  const statusFilters = ["all", "active", "inactive", "expired"] as const;

  return (
    <div className="flex flex-col h-full border-r bg-background/80 backdrop-blur-md rounded-2xl overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Coupons</h2>
            {meta && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {meta.total} coupon{meta.total !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onRefresh}
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        loading && "animate-spin"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button size="sm" onClick={onCreateOpen} className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => onFilterStatusChange(f)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full capitalize transition-colors",
                filterStatus === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <Select
          value={filterType}
          onValueChange={(v) =>
            onFilterTypeChange(v as "all" | "PERCENTAGE" | "FIXED_AMOUNT")
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
            <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      <CouponBulkBar
        count={selectedIds.size}
        onClear={onClearSelection}
        onBulkDelete={onBulkDelete}
      />

      <Separator />

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {loading && coupons.length === 0 ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Tag className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-sm">No coupons found</p>
            </div>
          ) : (
            coupons.map((coupon) => (
              <CouponListItem
                key={coupon.id}
                coupon={coupon}
                isActive={selectedCouponId === coupon.id}
                isSelected={selectedIds.has(coupon.id)}
                onSelect={() => onSelectCoupon(coupon.id)}
                onToggleCheckbox={(e) => onToggleCheckbox(coupon.id, e)}
                onEdit={(e) => onEdit(coupon, e)}
                onDelete={(e) => onDelete(coupon, e)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <>
          <Separator />
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-muted-foreground">
              {meta.from}–{meta.to} of {meta.total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={meta.current_page <= 1}
                onClick={() => onPageChange(meta.current_page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium px-1">
                {meta.current_page}/{meta.last_page}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => onPageChange(meta.current_page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}