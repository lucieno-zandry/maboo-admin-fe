import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { ImageUpload } from "~/components/image-upload";
import type { FieldErrors, FormImageEntry } from "../../types/product-form-types";
import { FieldError } from "./form-error-banner";
import type { Category } from "wle-core";

type Props = {
    title: string;
    slug: string;
    description: string;
    category_id: string;
    images: FormImageEntry[];
    categories: Category[];
    fieldErrors: FieldErrors;

    onTitleChange: (v: string) => void;
    onSlugChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onCategoryChange: (v: string) => void;
    onImagesAdd: (files: File[]) => void;
    onImageRemove: (key: string) => void;
};

export function ProductMetaFields({
    title,
    slug,
    description,
    category_id,
    images,
    categories,
    fieldErrors,
    onTitleChange,
    onSlugChange,
    onDescriptionChange,
    onCategoryChange,
    onImagesAdd,
    onImageRemove,
}: Props) {
    const handleFileAdd = (file: File | null) => {
        if (file) onImagesAdd([file]);
    };

    return (
        <div className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Premium Wireless Headphones"
                    className={fieldErrors["title"] ? "border-destructive" : ""}
                />
                <FieldError errors={fieldErrors["title"]} />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm h-9">
                        /product/
                    </span>
                    <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => onSlugChange(e.target.value)}
                        placeholder="premium-wireless-headphones"
                        className={`rounded-l-none font-mono text-sm ${fieldErrors["slug"] ? "border-destructive" : ""}`}
                    />
                </div>
                <FieldError errors={fieldErrors["slug"]} />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select value={category_id} onValueChange={onCategoryChange}>
                    <SelectTrigger id="category" className={fieldErrors["category_id"] ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select a category…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="-">No category</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FieldError errors={fieldErrors["category_id"]} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Describe the product…"
                    rows={4}
                    className="resize-none"
                />
                <FieldError errors={fieldErrors["description"]} />
            </div>

            {/* Images */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>
                        Images{" "}
                        <span className="text-muted-foreground font-normal text-xs">
                            ({images.length}/4)
                        </span>
                    </Label>
                </div>

                {images.length === 0 ? (
                    <ImageUpload
                        label=""
                        optionalText=""
                        accept="image/*"
                        maxSizeText="PNG, JPG, WEBP — max 4MB each"
                        onFileChange={handleFileAdd}
                        onRemoveImage={() => { }}
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, i) => {
                            const errorMessage = fieldErrors[`images.${i}`]
                            return <div key={img._key} className="relative">
                                {i === 0 && (
                                    <span className="absolute top-1 left-1 z-10 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-sm">
                                        MAIN
                                    </span>
                                )}
                                <ImageUpload
                                    label=""
                                    optionalText=""
                                    previewUrl={img.previewUrl}
                                    onRemoveImage={() => onImageRemove(img._key)}
                                    onFileChange={handleFileAdd}
                                    error={errorMessage?.[0]}
                                />
                            </div>
                        }
                        )}
                        {images.length < 4 && (
                            <ImageUpload
                                label=""
                                optionalText=""
                                accept="image/*"
                                maxSizeText="Add image"
                                onFileChange={handleFileAdd}
                                onRemoveImage={() => { }}
                            />
                        )}
                    </div>
                )}
                <FieldError errors={fieldErrors["images"]} />
            </div>
        </div>
    );
}