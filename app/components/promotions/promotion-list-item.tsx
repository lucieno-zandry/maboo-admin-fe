// ~/components/promotions/promotion-list-item.tsx
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCheck,
  Layers,
  GripVertical,
} from "lucide-react";
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
import { isAfter, isBefore, parseISO } from "date-fns";
import { PromotionTargetingBadge } from "./promotion-targeting-badge";
import type { Promotion } from "wle-core";

// ── Status helper (exported so detail panel reuses it) ────────────────────────

export type PromotionStatusInfo = {
  label: string;
  color: "green" | "amber" | "red" | "gray";
};

export function getPromotionStatus(p: Promotion): PromotionStatusInfo {
  const now = new Date();
  const start = parseISO(p.start_date);
  const end = parseISO(p.end_date);

  if (!p.is_active) return { label: "Inactive", color: "gray" };
  if (isBefore(now, start)) return { label: "Scheduled", color: "amber" };
  if (isAfter(now, end)) return { label: "Expired", color: "red" };
  return { label: "Active", color: "green" };
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type PromotionListItemProps = {
  promotion: Promotion;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleCheckbox: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PromotionListItem({
  promotion,
  isActive,
  isSelected,
  onSelect,
  onToggleCheckbox,
  onEdit,
  onDelete,
}: PromotionListItemProps) {
  const { label, color } = getPromotionStatus(promotion);

  const dotColor = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    gray: "bg-muted-foreground",
  }[color];

  const statusTextColor = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-500",
    gray: "text-muted-foreground",
  }[color];

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-3 cursor-pointer rounded-lg border transition-all duration-150",
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

      {/* Priority chip */}
      <div className="shrink-0 h-6 w-6 rounded-md bg-muted border flex items-center justify-center">
        <span className="text-[10px] font-bold text-muted-foreground">
          {promotion.priority}
        </span>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {/* Status dot */}
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
          <span className="font-medium text-sm truncate">{promotion.name}</span>
          {/* Badge label if set */}
          {promotion.badge && (
            <Badge
              variant="outline"
              className="text-[9px] py-0 h-3.5 px-1.5 border-0 bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 shrink-0"
            >
              {promotion.badge}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Discount */}
          <span
            className={cn(
              "text-xs font-semibold",
              promotion.type === "PERCENTAGE"
                ? "text-violet-600 dark:text-violet-400"
                : "text-sky-600 dark:text-sky-400"
            )}
          >
            {promotion.type === "PERCENTAGE"
              ? `−${promotion.discount}%`
              : `−${promotion.discount.toLocaleString()}`}
          </span>

          {/* Audience */}
          <PromotionTargetingBadge appliesTo={promotion.applies_to} size="xs" />

          {/* Stackable indicator */}
          {promotion.stackable && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Layers className="h-2.5 w-2.5" />
              Stackable
            </span>
          )}

          {/* Status text */}
          <span className={cn("text-[10px] font-medium ml-auto", statusTextColor)}>
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