import { useState, type Dispatch, type SetStateAction } from "react";
import { type ActionFunctionArgs } from "react-router";
import type { Category } from "wle-core";
import { createCategory, deleteCategory, updateCategory } from "~/api/http-requests";
import { CategoryDeleteDialog } from "~/components/categories/category-delete-dialog";
import { CategoryPageHeader } from "~/components/categories/category-page-header";
import { CategorySheet } from "~/components/categories/category-sheet";
import { CategoryTree } from "~/components/categories/category-tree";
import { FloatingAddButton } from "~/components/floating-add-button";

type CategoriesPageViewProps = {
    sheetConfig: {
        isOpen: boolean;
        mode: "create" | "edit";
        data?: any;
    };
    setSheetConfig: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        mode: "create" | "edit";
        data?: any;
    }>>;
    openCreate: () => void;
    onEdit: (category: Category) => void;
    onAddSub: (category: Category) => void;
    onDelete: (category: Category) => void;
    deleteConfig: {
        isOpen: boolean;
        data: Category | null;
    };
    setDeleteConfig: Dispatch<SetStateAction<{
        isOpen: boolean;
        data: Category | null;
    }>>
};

export function CategoriesPageView({ openCreate, onEdit, onAddSub, onDelete, setSheetConfig, sheetConfig, deleteConfig, setDeleteConfig }: CategoriesPageViewProps) {
    return (
        <>
            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-[2rem] p-8 shadow-2xl transition-colors duration-300 h-full overflow-y-auto">
                <CategoryPageHeader />
                <CategoryTree onEdit={onEdit} onAddSub={onAddSub} onDelete={onDelete} />
            </div>

            <FloatingAddButton onClick={openCreate} label="Add Category" />

            <CategorySheet
                isOpen={sheetConfig.isOpen}
                mode={sheetConfig.mode}
                initialData={sheetConfig.data}
                onClose={() => setSheetConfig(prev => ({ ...prev, isOpen: false }))}
            />

            <CategoryDeleteDialog
                category={deleteConfig.data}
                isOpen={deleteConfig.isOpen}
                onClose={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
            />
        </>
    );
}

export default function CategoriesPage() {
    const [sheetConfig, setSheetConfig] = useState<{
        isOpen: boolean;
        mode: "create" | "edit";
        data?: Partial<Category>;
    }>({
        isOpen: false,
        mode: "create"
    });

    const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; data: Category | null }>({
        isOpen: false,
        data: null,
    });

    const openCreate = () => setSheetConfig({ isOpen: true, mode: "create" });

    // We pass this down to the CategoryTree -> CategoryRow
    const openEdit = (category: Category) => setSheetConfig({
        isOpen: true,
        mode: "edit",
        data: category
    });

    const openAddSub = (category: Category) => setSheetConfig({
        isOpen: true,
        mode: "create",
        data: { parent_id: category.id }
    });

    const openDelete = (category: Category) => setDeleteConfig({
        isOpen: true,
        data: category
    });

    return <CategoriesPageView
        sheetConfig={sheetConfig}
        setSheetConfig={setSheetConfig}
        openCreate={openCreate}
        onEdit={openEdit}
        onAddSub={openAddSub}
        onDelete={openDelete}
        deleteConfig={deleteConfig}
        setDeleteConfig={setDeleteConfig}
    />;
}