import type { Product } from "wle-core";
import { create } from "zustand";

type SelectedProductStore = {
    product: Product | null;
    setProduct: (product: SelectedProductStore['product']) => void;
}

export default create<SelectedProductStore>(set => ({
    product: null,
    setProduct: (product) => set({ product }),
}));