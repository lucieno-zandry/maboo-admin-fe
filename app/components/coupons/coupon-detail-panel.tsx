// ~/components/coupons/coupon-detail-panel.tsx
import { useState, useCallback } from "react";
import {
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  CheckCheck,
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Hash,
} from "lucide-react";
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
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  differenceInDays,
} from "date-fns";
import { CouponStatCard } from "./coupon-stat-card";
import { CouponUsageOrders } from "./coupon-usage-orders";
import { getCouponStatus } from "./coupon-list-item";
import type { Coupon } from "wle-core";

// ── Code Copy Badge ───────────────────────────────────────────────────────────

function CouponCodeBadge({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onCopy}
            className="font-mono text-base font-bold tracking-widest bg-muted px-4 py-2 rounded-lg border hover:bg-muted/70 transition-colors flex items-center gap-2.5"
          >
            {code}
            {copied ? (
              <CheckCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Click to copy"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Validity Timeline ─────────────────────────────────────────────────────────

function ValidityTimeline({
  start_date,
  end_date,
}: {
  start_date: string;
  end_date: string;
}) {
  const now = new Date();
  const start = parseISO(start_date);
  const end = parseISO(end_date);
  const total = end.getTime() - start.getTime();
  const elapsed = Math.max(
    0,
    Math.min(now.getTime() - start.getTime(), total)
  );
  const percent = total > 0 ? (elapsed / total) * 100 : 0;
  const daysLeft = differenceInDays(end, now);
  const isExpired = isAfter(now, end);
  const isNotStarted = isBefore(now, start);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(start, "MMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1">
          {format(end, "MMM d, yyyy")}
          <Calendar className="h-3 w-3" />
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            isExpired
              ? "bg-red-500"
              : isNotStarted
                ? "bg-muted-foreground"
                : percent > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {isExpired
          ? "Expired"
          : isNotStarted
            ? `Starts in ${differenceInDays(start, now)} days`
            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
      </p>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type CouponDetailPanelProps = {
  coupon: Coupon | null;
  loading: boolean;
  selectedCouponId: number | null;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  mutating: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CouponDetailPanel({
  coupon,
  loading,
  selectedCouponId,
  onEdit,
  onDelete,
  onToggleActive,
  mutating,
}: CouponDetailPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coupon]);

  // Empty state
  if (!selectedCouponId) {
    return null;
  }

  // Loading skeleton
  if (loading || !coupon) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const { label, color } = getCouponStatus(coupon);
  const usagePercent = Math.min(
    (coupon.uses_count / coupon.max_uses) * 100,
    100
  );
  const isExpired = isAfter(new Date(), parseISO(coupon.end_date));
  const isNotStarted = isBefore(new Date(), parseISO(coupon.start_date));
  const isFull = coupon.uses_count >= coupon.max_uses;

  // Derive warning message
  let warningMsg: string | null = null;
  if (isFull) warningMsg = "This coupon has reached its maximum usage limit.";
  else if (isExpired) warningMsg = "This coupon has expired and can no longer be used.";
  else if (isNotStarted)
    warningMsg = `This coupon is scheduled and will activate on ${format(parseISO(coupon.start_date), "MMM d, yyyy")}.`;

  return (
    <ScrollArea className="h-full bg-background/80 backdrop-blur-md rounded-2xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CouponCodeBadge code={coupon.code} onCopy={handleCopy} copied={copied} />
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  color === "green" && "bg-emerald-500",
                  color === "amber" && "bg-amber-500",
                  color === "red" && "bg-red-500",
                  color === "gray" && "bg-muted-foreground"
                )}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
              <Badge
                className={cn(
                  "text-[10px] py-0 h-4 border-0 font-medium",
                  coupon.type === "PERCENTAGE"
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                    : "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
                )}
              >
                {coupon.type === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 h-4">
                ID #{coupon.id}
              </Badge>
            </div>
          </div>

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
                    {coupon.is_active ? (
                      <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {coupon.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle active state</TooltipContent>
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

        {/* ── Warning banner ──────────────────────────────────────────── */}
        {warningMsg && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {warningMsg}
          </div>
        )}

        {/* ── Stat grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <CouponStatCard
            icon={
              coupon.type === "PERCENTAGE" ? (
                <Percent className="h-4 w-4" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )
            }
            label="Discount"
            value={
              coupon.type === "PERCENTAGE"
                ? `${coupon.discount}%`
                : `${coupon.discount.toLocaleString()}`
            }
            sub={
              coupon.type === "PERCENTAGE"
                ? "percentage off"
                : "fixed amount off"
            }
            accent={coupon.type === "PERCENTAGE" ? "violet" : "default"}
          />
          <CouponStatCard
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Min Order"
            value={`${coupon.min_order_value.toLocaleString()}`}
            sub="minimum order value"
            accent="default"
          />
          <CouponStatCard
            icon={<Users className="h-4 w-4" />}
            label="Uses"
            value={`${coupon.uses_count}/${coupon.max_uses}`}
            sub={`${coupon.max_uses - coupon.uses_count} remaining`}
            accent={isFull ? "red" : usagePercent >= 80 ? "amber" : "default"}
          />
          <CouponStatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Usage Rate"
            value={`${Math.round(usagePercent)}%`}
            sub={`${coupon.uses_count} redemptions`}
            accent={
              usagePercent >= 90
                ? "red"
                : usagePercent >= 60
                  ? "amber"
                  : "green"
            }
          />
        </div>

        {/* ── Usage bar ───────────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Redemption capacity</span>
            <span>
              {coupon.uses_count} / {coupon.max_uses}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                usagePercent >= 90
                  ? "bg-red-500"
                  : usagePercent >= 60
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <Separator />

        {/* ── Validity window ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Validity Window
          </h3>
          <ValidityTimeline
            start_date={coupon.start_date}
            end_date={coupon.end_date}
          />
        </div>

        <Separator />

        {/* ── Orders that used this coupon ────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders Using This Coupon
            {coupon.orders && (
              <Badge variant="secondary" className="text-xs">
                {coupon.orders.length}
              </Badge>
            )}
          </h3>
          <CouponUsageOrders
            orders={coupon.orders}
            loading={false}
            couponDiscount={coupon.discount}
            couponType={coupon.type}
          />
        </div>
      </div>
    </ScrollArea>
  );
}