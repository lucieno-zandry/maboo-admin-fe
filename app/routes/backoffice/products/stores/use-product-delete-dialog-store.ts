import type { Product } from "wle-core";
import { create } from "zustand"

export type ProductDeleteDialogStore = {
    productToDelete: Product | null;
    productDeleteDialogOpen: boolean;
    setProductDeleteDialogOpen: (open: ProductDeleteDialogStore['productDeleteDialogOpen']) => void;
    setProductToDelete: (product: ProductDeleteDialogStore['productToDelete']) => void;
}

export default create<ProductDeleteDialogStore>(set => ({
    productDeleteDialogOpen: false,
    productToDelete: null,
    setProductToDelete: (productToDelete) => set({ productToDelete }),
    setProductDeleteDialogOpen: (productDeleteDialogOpen) => set({ productDeleteDialogOpen })
}));