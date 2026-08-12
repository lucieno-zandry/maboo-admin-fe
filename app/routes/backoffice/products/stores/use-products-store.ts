import type { Product } from "wle-core"
import { create } from "zustand"
import type { PaginatedResponse } from "~/api/app-fetch"

export type ProductsStore = {
    data?: PaginatedResponse<Product>,
    setData: (data: ProductsStore['data']) => void,
}

export default create<ProductsStore>(set => ({
    setData: (data) => set({ data }),
}))