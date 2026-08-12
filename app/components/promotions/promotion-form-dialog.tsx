// ~/components/promotions/promotion-form-dialog.tsx
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
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Loader2, Tag, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { CreatePromotionData } from "~/types/promotions";
import type { Promotion } from "wle-core";

// ── Props ─────────────────────────────────────────────────────────────────────

export type PromotionFormDialogProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialPromotion?: Promotion | null;
    onSubmit: (data: CreatePromotionData) => void;
    loading: boolean;
};

// ── Field Row helper (label + optional tooltip) ───────────────────────────────

function FieldLabel({
    label,
    tip,
    required,
}: {
    label: string;
    tip?: string;
    required?: boolean;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <Label className="text-sm">
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {tip && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px] text-xs">{tip}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PromotionFormDialog({
    open,
    onOpenChange,
    initialPromotion,
    onSubmit,
    loading,
}: PromotionFormDialogProps) {
    const isEdit = !!initialPromotion;

    // Form state
    const [name, setName] = useState("");
    const [discount, setDiscount] = useState("");
    const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [badge, setBadge] = useState("");
    const [appliesTo, setAppliesTo] = useState<Promotion["applies_to"]>("all");
    const [stackable, setStackable] = useState(false);
    const [priority, setPriority] = useState("10");
    const [applyOrder, setApplyOrder] = useState<
        "percentage_first" | "fixed_first" | "-"
    >("-");
    const [maxDiscount, setMaxDiscount] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate on open
    useEffect(() => {
        if (!open) return;
        if (initialPromotion) {
            setName(initialPromotion.name);
            setDiscount(String(initialPromotion.discount));
            setType(initialPromotion.type);
            setStartDate(initialPromotion.start_date.slice(0, 10));
            setEndDate(initialPromotion.end_date.slice(0, 10));
            setIsActive(initialPromotion.is_active);
            setBadge(initialPromotion.badge ?? "");
            setAppliesTo(initialPromotion.applies_to);
            setStackable(initialPromotion.stackable);
            setPriority(String(initialPromotion.priority));
            setApplyOrder(initialPromotion.apply_order ?? "-");
            setMaxDiscount(
                initialPromotion.max_discount != null
                    ? String(initialPromotion.max_discount)
                    : ""
            );
        } else {
            const today = new Date().toISOString().slice(0, 10);
            const nextMonth = new Date(Date.now() + 30 * 86400000)
                .toISOString()
                .slice(0, 10);
            setName("");
            setDiscount("");
            setType("PERCENTAGE");
            setStartDate(today);
            setEndDate(nextMonth);
            setIsActive(true);
            setBadge("");
            setAppliesTo("all");
            setStackable(false);
            setPriority("10");
            setApplyOrder("-");
            setMaxDiscount("");
        }
        setErrors({});
    }, [open, initialPromotion]);

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Name is required.";
        const disc = parseFloat(discount);
        if (!discount || isNaN(disc) || disc <= 0)
            e.discount = "Discount must be positive.";
        if (type === "PERCENTAGE" && disc > 100)
            e.discount = "Percentage cannot exceed 100.";
        if (!startDate) e.start_date = "Required.";
        if (!endDate) e.end_date = "Required.";
        if (startDate && endDate && endDate <= startDate)
            e.end_date = "Must be after start date.";
        const pri = parseInt(priority, 10);
        if (!priority || isNaN(pri) || pri < 1)
            e.priority = "Priority must be ≥ 1.";
        if (maxDiscount) {
            const max = parseFloat(maxDiscount);
            if (isNaN(max) || max <= 0) e.max_discount = "Must be positive.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSubmit({
            name: name.trim(),
            discount: parseFloat(discount),
            type,
            start_date: startDate,
            end_date: endDate,
            is_active: isActive,
            badge: badge.trim() || null,
            applies_to: appliesTo,
            stackable,
            priority: parseInt(priority, 10),
            apply_order: stackable && applyOrder && applyOrder !== '-' ? applyOrder : null,
            max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
        });
    };

    const previewBadgeColor =
        type === "PERCENTAGE"
            ? "bg-violet-100 text-violet-700"
            : "bg-sky-100 text-sky-700";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
                    <DialogTitle>
                        {isEdit ? "Edit Promotion" : "Create Promotion"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the configuration for this promotion."
                            : "Set up a new discount promotion for your products."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 px-6 h-[50vh] overflow-y-auto">
                    <div className="space-y-5 pb-2">
                        {/* ── Name + Badge ─────────────────────────────────────── */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-1.5">
                                <FieldLabel label="Promotion Name" required />
                                <Input
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setErrors((p) => ({ ...p, name: "" }));
                                    }}
                                    placeholder="e.g. Summer Sale 2025"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel
                                    label="Badge Label"
                                    tip="Short label shown on the product (e.g. SALE, HOT). Leave blank to hide."
                                />
                                <div className="relative">
                                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        value={badge}
                                        onChange={(e) => setBadge(e.target.value.slice(0, 16))}
                                        placeholder="SALE"
                                        className="pl-8"
                                    />
                                </div>
                                {badge && (
                                    <Badge
                                        className={cn(
                                            "text-xs border-0 mt-1",
                                            previewBadgeColor
                                        )}
                                    >
                                        {badge}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* ── Discount type + value ────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <FieldLabel label="Discount Type" required />
                                <Select
                                    value={type}
                                    onValueChange={(v) =>
                                        setType(v as "PERCENTAGE" | "FIXED_AMOUNT")
                                    }
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
                                <FieldLabel
                                    label={`Value (${type === "PERCENTAGE" ? "%" : "amount"})`}
                                    required
                                />
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

                        {/* ── Date range ───────────────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <FieldLabel label="Start Date" required />
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
                                <FieldLabel label="End Date" required />
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

                        {/* ── Audience ─────────────────────────────────────────── */}
                        <div className="space-y-1.5">
                            <FieldLabel
                                label="Applies To"
                                tip="Controls which customers see this promotion. 'Client Code' = only users with a client code. 'Regular' = users without one."
                            />
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        { value: "all", label: "Everyone" },
                                        { value: "client_code_only", label: "Client Code" },
                                        { value: "regular_only", label: "Regular" },
                                    ] as const
                                ).map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setAppliesTo(opt.value)}
                                        className={cn(
                                            "text-xs py-2 px-3 rounded-lg border transition-all font-medium",
                                            appliesTo === opt.value
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* ── Stacking config ──────────────────────────────────── */}
                        <div className="space-y-4">
                            {/* Stackable toggle */}
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <div className="space-y-0.5">
                                    <FieldLabel
                                        label="Stackable"
                                        tip="Allow this promotion to combine with other active promotions on the same product."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {stackable
                                            ? "Will combine with other active promotions"
                                            : "Applied exclusively — others won't stack"}
                                    </p>
                                </div>
                                <Switch
                                    checked={stackable}
                                    onCheckedChange={setStackable}
                                />
                            </div>

                            {/* Priority */}
                            <div className="space-y-1.5">
                                <FieldLabel
                                    label="Priority"
                                    required
                                    tip="Determines the order promotions are applied. Lower number = applied first."
                                />
                                <Input
                                    type="number"
                                    min={1}
                                    value={priority}
                                    onChange={(e) => {
                                        setPriority(e.target.value);
                                        setErrors((p) => ({ ...p, priority: "" }));
                                    }}
                                    placeholder="10"
                                    className="h-9"
                                />
                                {errors.priority && (
                                    <p className="text-xs text-destructive">{errors.priority}</p>
                                )}
                                <p className="text-[11px] text-muted-foreground">
                                    Suggested: 1–5 for primary deals, 10–20 for secondary
                                </p>
                            </div>

                            {/* Apply order (only when stackable) */}
                            {stackable && (
                                <div className="space-y-1.5">
                                    <FieldLabel
                                        label="Apply Order"
                                        tip="When stacking multiple promotions, which type is calculated first?"
                                    />
                                    <Select
                                        value={applyOrder}
                                        onValueChange={(v) =>
                                            setApplyOrder(
                                                v as "percentage_first" | "fixed_first" | "-"
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="No preference" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="-">No preference</SelectItem>
                                            <SelectItem value="percentage_first">
                                                Percentage first, then fixed
                                            </SelectItem>
                                            <SelectItem value="fixed_first">
                                                Fixed amount first, then percentage
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Max discount cap */}
                            <div className="space-y-1.5">
                                <FieldLabel
                                    label="Maximum Discount Cap"
                                    tip="The total discount will never exceed this value, regardless of stacking. Leave blank for no cap."
                                />
                                <Input
                                    type="number"
                                    min={1}
                                    step={0.01}
                                    value={maxDiscount}
                                    onChange={(e) => {
                                        setMaxDiscount(e.target.value);
                                        setErrors((p) => ({ ...p, max_discount: "" }));
                                    }}
                                    placeholder="Leave blank for no cap"
                                    className="h-9"
                                />
                                {errors.max_discount && (
                                    <p className="text-xs text-destructive">{errors.max_discount}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* ── Active toggle ────────────────────────────────────── */}
                        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Active</Label>
                                <p className="text-xs text-muted-foreground">
                                    Only active promotions are applied to products.
                                </p>
                            </div>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {isEdit ? "Save Changes" : "Create Promotion"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}