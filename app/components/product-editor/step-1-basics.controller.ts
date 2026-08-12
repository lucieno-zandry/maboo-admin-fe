import { useCallback, useEffect, useState } from "react";
import { useCategoryStore } from "~/hooks/use-category-store";
import { isDraftImageExisting, isDraftImageNew } from "~/lib/draft-images-helpers";
import type { DraftImage } from "~/types/drafts";

export type ImagePreview = {
    url: string;
    isExisting: boolean; // true = AppImage (already uploaded), false = new File
    objectUrl?: string;  // only set for File previews, so we can revoke it
};

export function useStep1Basics(
    title: string,
    slug: string,
    images: DraftImage[],
    onTitleChange: (t: string) => void,
    onSlugChange: (s: string) => void,
    onAddImages: (files: FileList | null) => void,
    onRemoveImage: (index: number) => void
) {
    const [slugEdited, setSlugEdited] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const { categories } = useCategoryStore();

    // Build previews. For AppImages we use the url directly.
    // For Files we create an object URL and clean it up on change.
    useEffect(() => {
        const previews: ImagePreview[] = [];
        const objectUrls: string[] = [];

        images.forEach((img) => {
            if (isDraftImageExisting(img)) {
                previews.push({ url: img.url, isExisting: true });
            } else if (isDraftImageNew(img)) {
                const url = URL.createObjectURL(img);
                objectUrls.push(url);
                previews.push({ url, isExisting: false, objectUrl: url });
            }
        });

        setImagePreviews(previews);
        return () => objectUrls.forEach(URL.revokeObjectURL);
    }, [images]);

    // Title → auto-derive slug (only when user hasn't manually touched slug)
    const handleTitleChange = useCallback(
        (value: string) => {
            onTitleChange(value);
            if (!slugEdited) {
                const auto = value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                onSlugChange(auto);
            }
        },
        [slugEdited, onTitleChange, onSlugChange]
    );

    const handleSlugChange = useCallback(
        (value: string) => {
            setSlugEdited(true);
            onSlugChange(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
        },
        [onSlugChange]
    );

    // Drag & drop handlers
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files?.length) {
                onAddImages(e.dataTransfer.files);
                e.dataTransfer.clearData();
            }
        },
        [onAddImages]
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    return {
        categories,
        imagePreviews,
        handleTitleChange,
        handleSlugChange,
        handleDrop,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        isDragging,
        slugEdited,
    };
}