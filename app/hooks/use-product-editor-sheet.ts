import type { Product } from "wle-core";
import { create } from "zustand";

type ProductEditorSheetStore = {
    open: boolean,
    product: Product | null,
    setOpen: (open: ProductEditorSheetStore['open'], product?: ProductEditorSheetStore['product']) => void,
}

create()

export default create<ProductEditorSheetStore>(set => ({
    open: false,
    product: null,
    setOpen: (open, product = null) => {
        set({ open, product })
    },
}))