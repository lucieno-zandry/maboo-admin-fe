import { HttpException, ValidationException } from "~/api/app-fetch";
import { useCategoryStore } from "~/hooks/use-category-store";
import useGetFieldErrors from "~/hooks/use-get-field-errors";
import { Button, Field, Select } from "wle-ui-package";
import type { SubmitEventHandler } from "react";
import type { Category } from "wle-core";

type CategoryFormProps = {
    initialData?: {
        id: number;
        title: string;
        parent_id?: number;
    };
    onCancel: () => void;
    actionData?: ValidationException | HttpException | null;
    getFieldErrors: (name: string) => string[] | null;
    categories: Category[];
    isLoading: boolean;
    onSubmit: SubmitEventHandler<HTMLFormElement>;
};

export function CategoryFormView({
    initialData,
    onCancel,
    actionData,
    categories,
    getFieldErrors,
    isLoading,
    onSubmit
}: CategoryFormProps) {
    return (
        <form method="post" className="flex flex-col h-full" onSubmit={onSubmit}>
            <div className="flex-1 space-y-6">
                {actionData instanceof HttpException && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        Server error: {actionData.status}.
                    </div>
                )}

                <input type="hidden" name="id" value={initialData?.id} />
                <input type="hidden" name="intent" value={initialData?.id ? "update" : "create"} />

                <Field
                    label="Title"
                    name="title"
                    defaultValue={initialData?.title}
                    validationErrors={getFieldErrors('title')}
                    placeholder="Category name..."
                    autoFocus
                />

                <Select
                    label="Parent Category"
                    name="parent_id"
                    defaultValue={initialData?.parent_id ?? ""}
                    validationErrors={getFieldErrors('parent_id')}
                >
                    <option value="" className="bg-popover text-popover-foreground">None (Top Level)</option>
                    {categories
                        .filter(cat => cat.id !== initialData?.id)
                        .map(cat => (
                            <option
                                key={cat.id}
                                value={cat.id}
                                className="bg-popover text-popover-foreground"
                            >
                                {cat.title}
                            </option>
                        ))
                    }
                </Select>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-3 mt-auto">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1">
                    {initialData?.id ? 'Update Category' : 'Create Category'}
                </Button>
            </div>
        </form>
    );
}


export function CategoryForm({ initialData, onCancel, isLoading, onSubmit, actionData }: Pick<CategoryFormProps, 'initialData' | 'onCancel' | 'isLoading' | 'onSubmit' | 'actionData'>) {
    const categories = useCategoryStore(state => state.categories);
    const getFieldErrors = useGetFieldErrors(actionData);

    return (
        <CategoryFormView
            initialData={initialData}
            onCancel={onCancel}
            getFieldErrors={getFieldErrors}
            categories={categories}
            actionData={actionData}
            isLoading={isLoading} // Pass this to the view
            onSubmit={onSubmit}
        />
    );
}