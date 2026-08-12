import { useMemo } from "react";
import { useNavigate } from "react-router";
import type { Product } from "wle-core";
import useRouterStore from "~/hooks/use-router-store";
import useSelectedProductStore from "~/hooks/use-selected-product-store";

export function useProductsPage() {
    const { lang } = useRouterStore();
    const { product: selectedProduct } = useSelectedProductStore();

    const selectedId = useMemo(() => selectedProduct?.id || null, [selectedProduct]);
    const navigate = useNavigate();

    const handleSelect = (product: Product) => {
        navigate(`/${lang}/products/${product.slug}`);
    };

    return { selectedId, selectedProduct, handleSelect };
}