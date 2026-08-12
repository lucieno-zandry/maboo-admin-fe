// ~/components/coupons/coupon-form-dialog.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import { Loader2, Shuffle, Hash } from "lucide-react";
import type { Coupon } from "wle-core";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCouponCode(): string {
  // Readable, unambiguous characters only
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = (len: number) =>
    Array.from({ length: len }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  // e.g. SAVE-XY34-AB78
  return `${segment(4)}-${segment(4)}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type CouponFormData = {
  code: string;
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  discount: number;
  min_order_value: number;
  max_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type CouponFormDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialCoupon?: Coupon | null;
  onSubmit: (data: CouponFormData) => void;
  loading: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function CouponFormDialog({
  open,
  onOpenChange,
  initialCoupon,
  onSubmit,
  loading,
}: CouponFormDialogProps) {
  const isEdit = !!initialCoupon;

  // ── Form state ────────────────────────────────────────────────────────
  const [code, setCode] = useState("");
  const [type, setType] = useState<"FIXED_AMOUNT" | "PERCENTAGE">("PERCENTAGE");
  const [discount, setDiscount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset on open
  useEffect(() => {
    if (!open) return;
    if (initialCoupon) {
      setCode(initialCoupon.code);
      setType(initialCoupon.type);
      setDiscount(String(initialCoupon.discount));
      setMinOrderValue(String(initialCoupon.min_order_value));
      setMaxUses(String(initialCoupon.max_uses));
      setStartDate(initialCoupon.start_date.slice(0, 10));
      setEndDate(initialCoupon.end_date.slice(0, 10));
      setIsActive(initialCoupon.is_active);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const nextMonth = new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .slice(0, 10);
      setCode("");
      setType("PERCENTAGE");
      setDiscount("");
      setMinOrderValue("0");
      setMaxUses("");
      setStartDate(today);
      setEndDate(nextMonth);
      setIsActive(true);
    }
    setErrors({});
  }, [open, initialCoupon]);

  // ── Validation ────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) e.code = "Code is required.";
    else if (cleanCode.length < 3) e.code = "Code must be at least 3 characters.";

    const disc = parseFloat(discount);
    if (!discount || isNaN(disc) || disc <= 0) e.discount = "Discount must be a positive number.";
    if (type === "PERCENTAGE" && disc > 100) e.discount = "Percentage cannot exceed 100.";

    const min = parseFloat(minOrderValue);
    if (isNaN(min) || min < 0) e.min_order_value = "Must be 0 or more.";

    const max = parseInt(maxUses, 10);
    if (!maxUses || isNaN(max) || max < 1) e.max_uses = "Must be at least 1.";

    if (!startDate) e.start_date = "Start date is required.";
    if (!endDate) e.end_date = "End date is required.";
    if (startDate && endDate && endDate <= startDate)
      e.end_date = "End date must be after start date.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      code: code.trim().toUpperCase(),
      type,
      discount: parseFloat(discount),
      min_order_value: parseFloat(minOrderValue) || 0,
      max_uses: parseInt(maxUses, 10),
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Coupon" : "Create Coupon"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this coupon code."
              : "Create a new discount coupon for your customers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* ── Code + generate ─────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label>Coupon Code</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={code}
                  onChange={(e) => {
                    setCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9-]/g, "")
                        .slice(0, 20)
                    );
                    setErrors((p) => ({ ...p, code: "" }));
                  }}
                  placeholder="e.g. SAVE20"
                  className="pl-8 font-mono tracking-wider"
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => setCode(generateCouponCode())}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate random code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code}</p>
            )}
          </div>

          {/* ── Type + Discount ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as typeof type)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Discount Value{" "}
                <span className="text-muted-foreground font-normal">
                  ({type === "PERCENTAGE" ? "%" : "amount"})
                </span>
              </Label>
              <Input
                type="number"
                min={0}
                max={type === "PERCENTAGE" ? 100 : undefined}
                step={type === "PERCENTAGE" ? 1 : 0.01}
                value={discount}
                onChange={(e) => {
                  setDiscount(e.target.value);
                  setErrors((p) => ({ ...p, discount: "" }));
                }}
                placeholder={type === "PERCENTAGE" ? "20" : "5000"}
                className="h-9"
              />
              {errors.discount && (
                <p className="text-xs text-destructive">{errors.discount}</p>
              )}
            </div>
          </div>

          {/* ── Min order + Max uses ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Min Order Value</Label>
              <Input
                type="number"
                min={0}
                value={minOrderValue}
                onChange={(e) => {
                  setMinOrderValue(e.target.value);
                  setErrors((p) => ({ ...p, min_order_value: "" }));
                }}
                placeholder="0"
                className="h-9"
              />
              {errors.min_order_value && (
                <p className="text-xs text-destructive">
                  {errors.min_order_value}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Max Uses</Label>
              <Input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => {
                  setMaxUses(e.target.value);
                  setErrors((p) => ({ ...p, max_uses: "" }));
                }}
                placeholder="100"
                className="h-9"
              />
              {errors.max_uses && (
                <p className="text-xs text-destructive">{errors.max_uses}</p>
              )}
            </div>
          </div>

          {/* ── Date range ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors((p) => ({ ...p, start_date: "" }));
                }}
                className="h-9"
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">{errors.start_date}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrors((p) => ({ ...p, end_date: "" }));
                }}
                className="h-9"
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">{errors.end_date}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Active toggle ────────────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div className="space-y-0.5">
              <Label className="text-sm">Active</Label>
              <p className="text-xs text-muted-foreground">
                Only active coupons can be redeemed by customers.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}