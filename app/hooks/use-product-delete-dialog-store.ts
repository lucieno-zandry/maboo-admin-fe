import type { Product } from "wle-core";
import { create } from "zustand";

type ProductDeleteDialogStore = {
    product: Product | null,
    setProduct: (product: ProductDeleteDialogStore['product']) => void;
}

export default create<ProductDeleteDialogStore>(set => ({
    product: null,
    setProduct: product => set({ product })
}))