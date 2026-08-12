// ~/components/variant-picker/variant-picker-variant-row.tsx
import { Package } from "lucide-react";
import type { Variant } from "wle-core";
import { cn } from "~/lib/utils";

export type VariantPickerVariantRowProps = {
  variant: Variant;
  isSelected: boolean;
  isAlreadyAssigned: boolean; // already on this promotion
  onToggle: () => void;
};

export function VariantPickerVariantRow({
  variant,
  isSelected,
  isAlreadyAssigned,
  onToggle,
}: VariantPickerVariantRowProps) {
  const optionLabel = variant.variant_options
    ?.map((o) => o.value)
    .join(" / ");

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isAlreadyAssigned}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all group",
        isAlreadyAssigned
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-muted/60",
        isSelected && !isAlreadyAssigned && "bg-primary/5"
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
          isAlreadyAssigned
            ? "border-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
            : isSelected
            ? "bg-primary border-primary"
            : "border-muted-foreground/40 group-hover:border-muted-foreground"
        )}
      >
        {(isSelected || isAlreadyAssigned) && (
          <div
            className={cn(
              "h-2 w-2 rounded-sm",
              isAlreadyAssigned ? "bg-emerald-500" : "bg-primary-foreground"
            )}
          />
        )}
      </div>

      {/* Variant image */}
      <div className="shrink-0 h-8 w-8 rounded border overflow-hidden bg-muted flex items-center justify-center">
        {variant.image?.url ? (
          <img
            src={variant.image.url}
            alt={variant.sku}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-3.5 w-3.5 text-muted-foreground/30" />
        )}
      </div>

      {/* SKU + options */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {variant.sku}
          </span>
          {optionLabel && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-foreground">{optionLabel}</span>
            </>
          )}
          {isAlreadyAssigned && (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Already assigned
            </span>
          )}
        </div>
      </div>

      {/* Price + stock */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold">{variant.price.toLocaleString()}</p>
        <p
          className={cn(
            "text-[10px]",
            variant.stock === 0
              ? "text-red-500"
              : variant.stock < 5
              ? "text-amber-500"
              : "text-muted-foreground"
          )}
        >
          {variant.stock === 0 ? "No stock" : `${variant.stock} in stock`}
        </p>
      </div>
    </button>
  );
}