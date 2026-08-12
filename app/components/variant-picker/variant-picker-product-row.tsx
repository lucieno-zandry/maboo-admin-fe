// ~/components/variant-picker/variant-picker-product-row.tsx
import { ChevronRight, Package, ImageOff } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { VariantPickerVariantRow } from "./variant-picker-variant-row";
import type { Product } from "wle-core";

// ── Product-level checkbox (none / partial / all) ─────────────────────────────

function ProductCheckbox({
  state,
  onClick,
}: {
  state: "none" | "partial" | "all";
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
        state === "all"
          ? "bg-primary border-primary"
          : state === "partial"
          ? "border-primary bg-primary/20"
          : "border-muted-foreground/40 hover:border-muted-foreground"
      )}
    >
      {state === "all" && (
        <div className="h-2 w-2 rounded-sm bg-primary-foreground" />
      )}
      {state === "partial" && (
        <div className="h-0.5 w-2 rounded-full bg-primary" />
      )}
    </button>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type VariantPickerProductRowProps = {
  product: Product;
  isExpanded: boolean;
  selectionState: "none" | "partial" | "all";
  selectedVariantIds: Set<number>;
  alreadyAssignedVariantIds: Set<number>;
  onToggleExpand: () => void;
  onToggleProduct: (e: React.MouseEvent) => void;
  onToggleVariant: (variantId: number) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function VariantPickerProductRow({
  product,
  isExpanded,
  selectionState,
  selectedVariantIds,
  alreadyAssignedVariantIds,
  onToggleExpand,
  onToggleProduct,
  onToggleVariant,
}: VariantPickerProductRowProps) {
  const mainImage = product.images?.[0]?.url;
  const variantCount = product.variants?.length ?? 0;
  const selectedCount = (product.variants ?? []).filter(
    (v) => selectedVariantIds.has(v.id)
  ).length;
  const assignedCount = (product.variants ?? []).filter(
    (v) => alreadyAssignedVariantIds.has(v.id)
  ).length;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-150",
        selectionState !== "none"
          ? "border-primary/25 bg-primary/[0.02]"
          : "border-border bg-background"
      )}
    >
      {/* Product header row */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        {/* Product checkbox */}
        <ProductCheckbox
          state={selectionState}
          onClick={(e) => {
            e.stopPropagation();
            onToggleProduct(e);
          }}
        />

        {/* Expand chevron */}
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-150",
            isExpanded && "rotate-90"
          )}
        />

        {/* Thumbnail */}
        <div className="shrink-0 h-9 w-9 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageOff className="h-4 w-4 text-muted-foreground/30" />
          )}
        </div>

        {/* Title + category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{product.title}</p>
            {product.category && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 h-4 shrink-0 text-muted-foreground"
              >
                {product.category.title}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {variantCount} variant{variantCount !== 1 ? "s" : ""}
            {assignedCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                {" "}
                · {assignedCount} already assigned
              </span>
            )}
            {selectedCount > 0 && (
              <span className="text-primary">
                {" "}
                · {selectedCount} selected
              </span>
            )}
          </p>
        </div>

        {/* Variant count badge */}
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] shrink-0",
            selectionState === "all" && "bg-primary/10 text-primary"
          )}
        >
          {variantCount}
        </Badge>
      </div>

      {/* Expanded variants */}
      {isExpanded && variantCount > 0 && (
        <div className="px-2 pb-2 space-y-0.5 border-t pt-2 bg-muted/20 rounded-b-xl">
          {product.variants!.map((variant) => (
            <VariantPickerVariantRow
              key={variant.id}
              variant={variant}
              isSelected={selectedVariantIds.has(variant.id)}
              isAlreadyAssigned={alreadyAssignedVariantIds.has(variant.id)}
              onToggle={() => onToggleVariant(variant.id)}
            />
          ))}
        </div>
      )}

      {/* Empty variants message */}
      {isExpanded && variantCount === 0 && (
        <div className="px-4 pb-3 pt-2 border-t text-xs text-muted-foreground flex items-center gap-2">
          <Package className="h-3.5 w-3.5" />
          No variants configured for this product
        </div>
      )}
    </div>
  );
}