import { useEffect, useRef } from "react";
import { useProductFormStore } from "../../stores/use-product-form-store";
import { slugify } from "../../helpers/slugify";
import { ProductMetaFields } from "./product-meta-fields";
import type { Category } from "wle-core";

type Props = {
    categories: Category[];
};

/** Smart container: reads store, dispatches actions, auto-slugifies title. */
export function ProductMetaStep({ categories }: Props) {
    const {
        title,
        slug,
        description,
        category_id,
        images,
        fieldErrors,
        editingProductId,
        setTitle,
        setSlug,
        setDescription,
        setCategoryId,
        addImages,
        removeImage,
    } = useProductFormStore();

    // Auto-derive slug from title in CREATE mode only
    const userEditedSlug = useRef(false);

    useEffect(() => {
        if (!editingProductId && !userEditedSlug.current) {
            setSlug(slugify(title));
        }
    }, [title, editingProductId, setSlug]);

    function handleSlugChange(v: string) {
        userEditedSlug.current = true;
        setSlug(slugify(v));
    }

    return (
        <ProductMetaFields
            title={title}
            slug={slug}
            description={description}
            category_id={category_id}
            images={images}
            categories={categories}
            fieldErrors={fieldErrors}
            onTitleChange={setTitle}
            onSlugChange={handleSlugChange}
            onDescriptionChange={setDescription}
            onCategoryChange={setCategoryId}
            onImagesAdd={addImages}
            onImageRemove={removeImage}
        />
    );
}