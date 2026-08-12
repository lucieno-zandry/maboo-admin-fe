import type { Product } from "wle-core";
import { create } from "zustand";

export type ProductsStore = {
    products: Product[],
    setProducts: (products: ProductsStore['products']) => void;
}

export default create<ProductsStore>(set => ({
    products: [],
    setProducts: (products) => set({ products }),
}))