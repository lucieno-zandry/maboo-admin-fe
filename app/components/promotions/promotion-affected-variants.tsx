// ~/components/promotions/promotion-affected-variants.tsx
import { Package, ExternalLink, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { Link, useParams } from "react-router";
import type { Variant } from "wle-core";

export type PromotionAffectedVariantsProps = {
  variants: Variant[] | undefined;
  loading: boolean;
  onDetach: (variantId: number) => void;
  disabled: boolean;
};

export function PromotionAffectedVariants({
  variants,
  loading,
  onDetach,
  disabled,
}: PromotionAffectedVariantsProps) {
  const { lang } = useParams();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!variants || variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border rounded-xl border-dashed text-muted-foreground">
        <Package className="h-6 w-6 mb-2 opacity-30" />
        <p className="text-xs">No variants assigned to this promotion</p>
        <p className="text-[11px] mt-1 opacity-60">
          Assign this promotion to product variants from the product editor
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {variants.map((variant) => {
        // Build human-readable option string (e.g. "Red / XL")
        const optionLabel = variant.variant_options
          ?.map((o) => o.value)
          .join(" / ");

        return (
          <div
            key={variant.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group"
          >
            {/* Product thumbnail */}
            <div className="shrink-0 h-9 w-9 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
              {variant.image?.url ? (
                <img
                  src={variant.image.url}
                  alt={variant.product?.title ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-4 w-4 text-muted-foreground/40" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {variant.product?.title ?? "Unknown product"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {variant.sku}
                </span>
                {optionLabel && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      {optionLabel}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold">
                {variant.price.toLocaleString()}
              </p>
              {variant.stock !== undefined && (
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
                  {variant.stock === 0 ? "Out of stock" : `${variant.stock} in stock`}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity">
              {variant.product?.slug && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link to={`/${lang}/products/${variant.product.slug}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View product</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => onDetach(variant.id)}
                      disabled={disabled}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove from promotion</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        );
      })}
    </div>
  );
}