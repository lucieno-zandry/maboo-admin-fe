// ~/components/categories/category-delete-dialog.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { useFetcher, useRevalidator } from "react-router";
import { Button } from "wle-ui-package";
import { useEffect, useState } from "react";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { toast } from "sonner";
import { deleteCategory } from "~/api/http-requests";
import { useCategoryStore } from "~/hooks/use-category-store";
import type { Category } from "wle-core";

type CategoryDeleteDialogProps = {
    category: Category | null,
    isOpen: boolean,
    onClose: () => void,
    handleDelete: () => void,
    isLoading: boolean,
}

export function CategoryDeleteDialogView({
    category,
    isOpen,
    onClose,
    handleDelete,
    isLoading
}: CategoryDeleteDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-card/80 backdrop-blur-2xl border-border shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete the category <strong className="text-foreground">"{category?.title}"</strong>.
                        Note: If this category has children, they may become orphaned or deleted depending on your database constraints.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-border hover:bg-accent text-foreground">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction asChild onClick={e => e.preventDefault()}>
                        <Button variant={'destructive'} onClick={handleDelete} isLoading={isLoading}>
                            Delete Category
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function CategoryDeleteDialog({ category, onClose, ...props }: Omit<CategoryDeleteDialogProps, "handleDelete" | "isLoading">) {
    const [isLoading, setIsLoading] = useState(false);
    const { fetchCategories } = useCategoryStore();

    const handleDelete = async () => {
        if (!category) return;

        try {
            setIsLoading(true);

            await deleteCategory(category.id.toString());

            toast.success("Category deleted successfully!");
            onClose();
            fetchCategories();
        } catch (error) {
            if (error instanceof ValidationException) {
                toast.error("Validation failed");
                return;
            }

            if (error instanceof HttpException) {
                toast.error(error.data?.message || "Failed to delete category");
                return;
            }

            toast.error("Unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return <CategoryDeleteDialogView
        category={category}
        onClose={onClose}
        handleDelete={handleDelete}
        isLoading={isLoading}
        {...props} />
}