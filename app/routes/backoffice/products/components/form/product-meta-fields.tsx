import { ImagePlus, X } from "lucide-react";
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
    function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length) onImagesAdd(files);
        e.target.value = "";
    }

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
                    {images.length < 4 && (
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            <ImagePlus className="h-3.5 w-3.5" />
                            Add images
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                className="sr-only"
                                onChange={handleFilePick}
                            />
                        </label>
                    )}
                </div>

                {images.length === 0 ? (
                    <label
                        htmlFor="image-upload-zone"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
                    >
                        <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary/70 transition-colors mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload images</span>
                        <span className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, WEBP — max 4MB each</span>
                        <input
                            id="image-upload-zone"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={handleFilePick}
                        />
                    </label>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {images.map((img, i) => (
                            <div key={img._key} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                                {i === 0 && (
                                    <span className="absolute top-1 left-1 z-10 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-sm">
                                        MAIN
                                    </span>
                                )}
                                <img
                                    src={img.previewUrl}
                                    alt={`Product image ${i + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => onImageRemove(img._key)}
                                    className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {images.length < 4 && (
                            <label
                                htmlFor="image-upload-extra"
                                className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                            >
                                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                <input
                                    id="image-upload-extra"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="sr-only"
                                    onChange={handleFilePick}
                                />
                            </label>
                        )}
                    </div>
                )}
                <FieldError errors={fieldErrors["images"]} />
            </div>
        </div>
    );
}