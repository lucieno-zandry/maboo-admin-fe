// ~/components/coupons/coupon-list-item.tsx
import { MoreHorizontal, Pencil, Trash2, CheckCheck, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { isBefore, isAfter, parseISO } from "date-fns";
import type { Coupon } from "wle-core";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getCouponStatus(coupon: Coupon): {
  label: string;
  color: "green" | "amber" | "red" | "gray";
} {
  const now = new Date();
  const start = parseISO(coupon.start_date);
  const end = parseISO(coupon.end_date);
  const isFull = coupon.uses_count >= coupon.max_uses;

  if (!coupon.is_active) return { label: "Inactive", color: "gray" };
  if (isBefore(now, start)) return { label: "Scheduled", color: "amber" };
  if (isAfter(now, end)) return { label: "Expired", color: "red" };
  if (isFull) return { label: "Exhausted", color: "red" };
  return { label: "Active", color: "green" };
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type CouponListItemProps = {
  coupon: Coupon;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleCheckbox: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CouponListItem({
  coupon,
  isActive,
  isSelected,
  onSelect,
  onToggleCheckbox,
  onEdit,
  onDelete,
}: CouponListItemProps) {
  const { label, color } = getCouponStatus(coupon);
  const usagePercent = Math.min(
    (coupon.uses_count / coupon.max_uses) * 100,
    100
  );

  const dotColor = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    gray: "bg-muted-foreground",
  }[color];

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg border transition-all duration-150",
        isActive
          ? "bg-primary/5 border-primary/30 shadow-sm"
          : "border-transparent hover:bg-muted/50 hover:border-border"
      )}
    >
      {/* Checkbox */}
      <div
        onClick={onToggleCheckbox}
        className={cn(
          "shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
          isSelected
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 opacity-0 group-hover:opacity-100"
        )}
      >
        {isSelected && (
          <CheckCheck className="h-2.5 w-2.5 text-primary-foreground" />
        )}
      </div>

      {/* Status dot */}
      <div className={cn("shrink-0 h-2 w-2 rounded-full", dotColor)} />

      {/* Code & meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-sm tracking-wider truncate">
            {coupon.code}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] py-0 h-4 shrink-0 border-0 font-medium",
              coupon.type === "PERCENTAGE"
                ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                : "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
            )}
          >
            {coupon.type === "PERCENTAGE"
              ? `${coupon.discount}%`
              : `${coupon.discount} off`}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {coupon.uses_count}/{coupon.max_uses} uses
          </span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[48px]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePercent >= 90
                  ? "bg-red-500"
                  : usagePercent >= 60
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <span
            className={cn(
              "text-[10px] font-medium",
              color === "green" && "text-emerald-600",
              color === "amber" && "text-amber-600",
              color === "red" && "text-red-500",
              color === "gray" && "text-muted-foreground"
            )}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Row actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}