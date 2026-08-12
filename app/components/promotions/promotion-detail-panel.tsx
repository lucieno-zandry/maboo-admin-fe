// ~/components/promotions/promotion-detail-panel.tsx
import { useState, useCallback } from "react";
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  CheckCheck,
  Zap,
  Percent,
  DollarSign,
  Layers,
  ArrowDownUp,
  Hash,
  Package,
  Clock,
  AlertTriangle,
  Tag,
  Shield,
  SlidersHorizontal,
  PackagePlus,
} from "lucide-react";
import { PromotionAssignVariantsDialog } from "./promotion-assign-variants-dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { isAfter, isBefore, parseISO } from "date-fns";
import { PromotionStatCard } from "./promotion-stat-card";
import { PromotionValidityTimeline } from "./promotion-validity-timeline";
import { PromotionTargetingBadge } from "./promotion-targeting-badge";
import { PromotionAffectedVariants } from "./promotion-affected-variants";
import { getPromotionStatus } from "./promotion-list-item";
import type { Promotion } from "wle-core";

// ── Stacking config card ──────────────────────────────────────────────────────

function StackingConfig({ promotion }: { promotion: Promotion }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Stacking Configuration
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {/* Stackable */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Stackable</p>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                promotion.stackable ? "bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            <span className="text-sm font-medium">
              {promotion.stackable ? "Yes" : "No"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {promotion.stackable
              ? "Can combine with other promotions"
              : "Applied exclusively — no stacking"}
          </p>
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Priority</p>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold leading-none">
              {promotion.priority}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Lower = applied first
          </p>
        </div>

        {/* Apply order */}
        {promotion.stackable && promotion.apply_order && (
          <div className="col-span-2 space-y-1">
            <p className="text-xs text-muted-foreground">Apply Order</p>
            <Badge
              variant="outline"
              className="text-xs gap-1.5 border-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowDownUp className="h-3 w-3" />
              {promotion.apply_order === "percentage_first"
                ? "Percentage first, then fixed"
                : "Fixed amount first, then percentage"}
            </Badge>
          </div>
        )}

        {/* Max discount */}
        {promotion.max_discount != null && (
          <div className="col-span-2 space-y-1">
            <p className="text-xs text-muted-foreground">Discount Cap</p>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-sm font-medium">
                Max {promotion.max_discount.toLocaleString()} discount
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Discount will never exceed this amount
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type PromotionDetailPanelProps = {
  promotion: Promotion | null;
  loading: boolean;
  selectedPromotionId: number | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onDetachVariant: (variantId: number) => void;
  onVariantsAssigned: () => void; // called after bulk-assign to trigger detail refresh
  mutating: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PromotionDetailPanel({
  promotion,
  loading,
  selectedPromotionId,
  onEdit,
  onDelete,
  onToggleActive,
  onDetachVariant,
  onVariantsAssigned,
  mutating,
}: PromotionDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const handleCopyName = useCallback(() => {
    if (!promotion) return;
    navigator.clipboard.writeText(promotion.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [promotion]);

  // Empty state
  if (!selectedPromotionId) {
    return null;
  }

  // Loading skeleton
  if (loading || !promotion) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const { label, color } = getPromotionStatus(promotion);
  const isExpired = isAfter(new Date(), parseISO(promotion.end_date));
  const isNotStarted = isBefore(new Date(), parseISO(promotion.start_date));

  const dotColor = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    gray: "bg-muted-foreground",
  }[color];

  // Build warning message
  let warningMsg: string | null = null;
  if (isExpired && promotion.is_active)
    warningMsg = "This promotion has expired. Deactivate it or extend the end date.";
  else if (isNotStarted)
    warningMsg = `This promotion is scheduled and not yet live.`;

  const variantCount = promotion.variants?.length ?? 0;

  return (
    <>
    <ScrollArea className="h-full bg-background/80 backdrop-blur-md rounded-2xl">
      <div className="p-6 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            {/* Name + copy */}
            <div className="flex items-start gap-2">
              <h1 className="text-xl font-bold leading-tight break-words">
                {promotion.name}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopyName}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Copy name</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Meta badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn("h-2 w-2 rounded-full shrink-0", dotColor)} />
              <span className="text-xs text-muted-foreground">{label}</span>

              <PromotionTargetingBadge
                appliesTo={promotion.applies_to}
                size="sm"
              />

              {promotion.badge && (
                <Badge className="text-xs gap-1 bg-rose-100 text-rose-700 border-0 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100">
                  <Tag className="h-3 w-3" />
                  {promotion.badge}
                </Badge>
              )}

              <Badge variant="outline" className="text-[10px] py-0 h-4">
                ID #{promotion.id}
              </Badge>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={onToggleActive}
                    disabled={mutating}
                  >
                    {promotion.is_active ? (
                      <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {promotion.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle active state</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setAssignOpen(true)}
                  >
                    <PackagePlus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Assign variants</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:border-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Warning banner */}
        {warningMsg && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {warningMsg}
          </div>
        )}

        {/* ── Stat grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <PromotionStatCard
            icon={
              promotion.type === "PERCENTAGE" ? (
                <Percent className="h-4 w-4" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )
            }
            label="Discount"
            value={
              promotion.type === "PERCENTAGE"
                ? `${promotion.discount}%`
                : `${promotion.discount.toLocaleString()}`
            }
            sub={
              promotion.type === "PERCENTAGE"
                ? "percentage off"
                : "fixed amount off"
            }
            accent={promotion.type === "PERCENTAGE" ? "violet" : "teal"}
          />

          <PromotionStatCard
            icon={<Hash className="h-4 w-4" />}
            label="Priority"
            value={String(promotion.priority)}
            sub="execution order (lower = first)"
            accent="default"
          />

          <PromotionStatCard
            icon={<Package className="h-4 w-4" />}
            label="Affected Variants"
            value={String(variantCount)}
            sub={variantCount === 0 ? "no variants assigned" : "SKUs on promotion"}
            accent={variantCount === 0 ? "amber" : "default"}
          />

          <PromotionStatCard
            icon={<Layers className="h-4 w-4" />}
            label="Stackable"
            value={promotion.stackable ? "Yes" : "No"}
            sub={
              promotion.stackable
                ? "combines with other deals"
                : "exclusive promotion"
            }
            accent={promotion.stackable ? "indigo" : "default"}
          />
        </div>

        {/* ── Validity timeline ───────────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Validity Window
          </h3>
          <PromotionValidityTimeline
            start_date={promotion.start_date}
            end_date={promotion.end_date}
          />
        </div>

        <Separator />

        {/* ── Stacking configuration ──────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Stacking & Priority
          </h3>
          <StackingConfig promotion={promotion} />
        </div>

        <Separator />

        {/* ── Affected variants ───────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Assigned Variants
              <Badge variant="secondary" className="text-xs">
                {variantCount}
              </Badge>
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setAssignOpen(true)}
            >
              <PackagePlus className="h-3.5 w-3.5" />
              Assign variants
            </Button>
          </div>
          <PromotionAffectedVariants
            variants={promotion.variants}
            loading={false}
            onDetach={onDetachVariant}
            disabled={mutating}
          />
        </div>
      </div>
      </ScrollArea>

      {/* Assign variants dialog */}
      <PromotionAssignVariantsDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        promotionId={promotion.id}
        promotionName={promotion.name}
        alreadyAssignedVariantIds={promotion.variants?.map((v) => v.id) ?? []}
        onAssigned={onVariantsAssigned}
      />
    </>
  );
}