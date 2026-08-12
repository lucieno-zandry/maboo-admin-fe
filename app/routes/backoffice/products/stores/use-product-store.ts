import type { Product } from "wle-core"
import { create } from "zustand"
import type { PaginatedResponse } from "~/api/app-fetch"

export type ProductStore = {
    product?: Product,
    setProduct: (product: ProductStore['product']) => void,
}

export default create<ProductStore>(set => ({
    setProduct: (product) => set({ product }),
}))