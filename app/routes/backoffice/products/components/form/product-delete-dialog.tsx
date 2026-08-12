import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog"
import useProductDeleteDialogStore from "../../stores/use-product-delete-dialog-store";
import { useDeleteProduct } from "../../hooks/use-delete-product";
import type { Product } from "wle-core";

export type ProductDeleteDialogViewProps = {
    productDeleteDialogOpen: boolean;
    setProductDeleteDialogOpen: (open: ProductDeleteDialogViewProps['productDeleteDialogOpen']) => void;
    onConfirmDelete: () => void;
    productToDelete: Product | null;
}

export function ProductDeleteDialogView({ onConfirmDelete, productDeleteDialogOpen, productToDelete, setProductDeleteDialogOpen }: ProductDeleteDialogViewProps) {
    return <AlertDialog open={productDeleteDialogOpen} onOpenChange={setProductDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete <span className="font-semibold text-foreground">"{productToDelete?.title}"</span>? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={onConfirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}

export default function ({ onSuccess }: { onSuccess?: () => void }) {
    const { productDeleteDialogOpen, productToDelete, setProductDeleteDialogOpen, setProductToDelete } = useProductDeleteDialogStore();
    const deleteProduct = useDeleteProduct();

    const handleConfirmDelete = async () => {
        if (productToDelete) {
            await deleteProduct.mutate([productToDelete.id]);
            onSuccess?.();
            setProductDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    return <ProductDeleteDialogView
        productDeleteDialogOpen={productDeleteDialogOpen}
        productToDelete={productToDelete}
        setProductDeleteDialogOpen={setProductDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
    />
}