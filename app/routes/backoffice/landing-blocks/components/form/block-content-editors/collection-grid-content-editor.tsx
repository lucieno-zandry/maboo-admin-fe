// app/routes/backoffice/landing-blocks/components/editors/collection-grid-editor.tsx
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Trash2, ArrowUp, ArrowDown, ImageIcon, Loader2, X, GripVertical } from "lucide-react";
import { useState } from "react";
import { useCategoryStore } from "~/hooks/use-category-store";
import { storeImage, deleteImage } from "~/api/http-requests";
import { toast } from "sonner";
import type { CollectionItem } from "../../../types/landing-block-form-types";
import type { CollectionContentItem } from "wle-core";

interface Props {
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
}

export function CollectionGridContentEditor({ value, onChange }: Props) {
    const items: CollectionItem[] = value.items?.map((item: CollectionContentItem) => ({
        ...item,
        imageUrl: item.image?.url,
    })) ?? [];

    const { categories } = useCategoryStore();
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const updateItems = (newItems: CollectionItem[]) => {
        // Filter out 
        onChange({
            ...value,
            items: newItems.map(({ imageUrl, image_file, ...item }) => item)
        });
    };

    const addItem = () => {
        const newId = crypto.randomUUID();
        updateItems([
            ...items,
            {
                id: newId,
                category_id: 0,
                display_order: items.length,
            },
        ]);
    };

    const removeItem = (index: number) => {
        const updated = [...items];
        const removed = updated.splice(index, 1)[0];
        // If the removed item had an image, delete it from server
        if (removed.image_id) {
            deleteImage(removed.image_id).catch(console.error);
        }
        updateItems(updated);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const updated = [...items];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        // Update display_order values
        updated.forEach((item, idx) => { item.display_order = idx; });
        updateItems(updated);
    };

    const updateItem = (index: number, updatedItem: Partial<CollectionItem>) => {
        const updated = [...items];
        updated[index] = { ...updated[index], ...updatedItem };
        updateItems(updated);
    };

    const handleImageChange = async (index: number, file: File | null) => {
        if (!file) return;
        setUploadingIndex(index);
        try {
            const existingId = items[index].image_id;
            if (existingId) {
                await deleteImage(existingId);
            }

            const response = await storeImage({ image: file, path: 'landing-blocks/collections' });
            const newImage = response.data!.image;

            updateItem(index, { image_id: newImage.id, image: newImage });
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setUploadingIndex(null);
        }
    };

    const removeImage = async (index: number) => {
        const item = items[index];
        if (item.image_id) {
            try {
                await deleteImage(item.image_id);
                updateItem(index, { image_id: null, image: undefined, });
            } catch (error) {
                toast.error("Failed to delete image");
            }
        }
    };

    const getCategoryTitle = (categoryId: number) => {
        const cat = categories?.find(c => c.id === categoryId);
        return cat?.title ?? "Unknown category";
    };

    const eyebrow = value.eyebrow ?? "";

    const updateEyebrow = (newEyebrow: string) => {
        onChange({ ...value, eyebrow: newEyebrow, items: value.items ?? [] });
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Collection items</Label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add category
                </Button>
            </div>

            <div>
                <Label className="text-xs font-medium">Eyebrow (optional)</Label>
                <Input
                    value={eyebrow}
                    onChange={(e) => updateEyebrow(e.target.value)}
                    placeholder="e.g., Explore the range"
                />
            </div>

            {items.map((item, idx) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-background">
                    {/* Header with drag/move controls */}
                    <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span className="text-xs font-medium text-muted-foreground">
                            {item.category_id ? getCategoryTitle(item.category_id) : "New item"}
                        </span>
                        <div className="flex gap-1 ml-auto">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveItem(idx, 'up')}
                                disabled={idx === 0}
                            >
                                <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveItem(idx, 'down')}
                                disabled={idx === items.length - 1}
                            >
                                <ArrowDown className="h-3 w-3" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeItem(idx)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Category selector */}
                    <div>
                        <Label className="text-xs">Category</Label>
                        <select
                            className="w-full rounded-md border p-2"
                            value={item.category_id}
                            onChange={(e) => updateItem(idx, {
                                category_id: Number(e.target.value),
                                category: categories.find(c => c.id === Number(e.target.value))
                            })}
                            required>
                            <option value={0}>Select a category</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subtitle */}
                    <div>
                        <Label className="text-xs">Subtitle (optional)</Label>
                        <Input
                            value={item.subtitle ?? ""}
                            onChange={(e) => updateItem(idx, { subtitle: e.target.value })}
                            placeholder="e.g., Hand-picked Bourbon"
                        />
                    </div>

                    {/* Image upload with preview */}
                    <div>
                        <Label className="text-xs">Item image</Label>
                        <div className="mt-1 flex items-start gap-3">
                            {(item.imageUrl || (item.image_id && !item.image_file)) && (
                                <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted">
                                    <img
                                        src={item.imageUrl ?? `/api/images/${item.image_id}`}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                                        onClick={() => removeImage(idx)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                            <label className="flex flex-col items-center justify-center w-32 h-16 border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/40 transition">
                                {uploadingIndex === idx ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => handleImageChange(idx, e.target.files?.[0] ?? null)}
                                    disabled={uploadingIndex === idx}
                                />
                            </label>
                        </div>
                        {item.image_id && !item.image_file && (
                            <p className="text-[10px] text-muted-foreground mt-1">Image ID: {item.image_id}</p>
                        )}
                    </div>
                </div>
            ))}

            {items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                    No collections yet. Click "Add category" to start.
                </p>
            )}
        </div>
    );
}