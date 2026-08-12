import { useMemo } from "react";
import type { Product } from "wle-core";

export type ProductListItemProps = {
    product: Product;
    isSelected: boolean;
    onClick: (product: Product) => void;
};

export function useProductListItem(product: Product) {
    const totalStock = useMemo(
        () => product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0,
        [product.variants]
    );

    const variantCount = product.variants?.length ?? 0;

    const lowestPrice = useMemo(() => {
        if (!product.variants?.length) return null;
        return Math.min(...product.variants.map((v) => v.effective_price ?? v.price));
    }, [product.variants]);

    const hasDiscount = product.variants?.some((v) => v.effective_price !== null) ?? false;

    const stockStatus: "in_stock" | "low_stock" | "out_of_stock" =
        totalStock === 0 ? "out_of_stock" : totalStock <= 5 ? "low_stock" : "in_stock";

    const thumbnail = product.images?.[0]?.url ?? null;

    return { totalStock, variantCount, lowestPrice, hasDiscount, stockStatus, thumbnail };
}