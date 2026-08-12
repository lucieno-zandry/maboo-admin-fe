import { Package, Trash2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import formatPrice from "~/lib/format-price";
import type { Product } from "wle-core";

const stockBadgeVariant = {
    in_stock: "default",
    low_stock: "secondary",
    out_of_stock: "destructive",
} as const;

const stockLabel = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
} as const;

interface ProductListItemProps {
    product: Product;
    isSelected: boolean;
    onSelect: (slug: string) => void;
    onDelete: (product: Product) => void;
}

export const ProductListItem = ({ product, isSelected, onSelect, onDelete }: ProductListItemProps) => {
    const variants = product.variants || [];
    const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);
    const stockStatus = totalStock > 10 ? 'in_stock' : totalStock > 0 ? 'low_stock' : 'out_of_stock';

    const prices = variants.map(v => v.effective_price ?? v.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const hasDiscount = variants.some(v => v.effective_price !== undefined && v.effective_price < v.price);
    const thumbnail = product.images?.[0]?.url;

    return (
        <div
            onClick={() => onSelect(product.slug)}
            className={cn(
                "group w-full text-left flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer",
                isSelected && "bg-muted border-l-2 border-l-primary pl-[14px]"
            )}
        >
            <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                {thumbnail ? <img src={thumbnail} alt={product.title} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {product.category?.title ?? "Uncategorized"} · {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1">
                {lowestPrice !== null && (
                    <span className={cn("text-sm font-semibold", hasDiscount && "text-emerald-600 dark:text-emerald-400")}>
                        {formatPrice(lowestPrice)}
                    </span>
                )}
                <Badge variant={stockBadgeVariant[stockStatus]} className="text-[10px] py-0 h-4 px-1.5 rounded-sm uppercase tracking-wider font-semibold">
                    {stockLabel[stockStatus]}
                </Badge>
            </div>

            <div className="shrink-0 ml-2 pl-2 border-l flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};