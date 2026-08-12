import { ImagePlus, X, Link } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { ProductEditorController } from "./product-editor.controller";
import { useStep1Basics } from "./step-1-basics.controller";
import type { ProductDraft } from "~/types/drafts";

type Step1BasicsProps = {
    draft: ProductDraft;
    ctrl: Pick<
        ProductEditorController,
        "setBasics" | "setTitleAndSlug" | "addImages" | "removeImage"
    >;
};

export function Step1Basics({ draft, ctrl }: Step1BasicsProps) {
    const {
        categories,
        imagePreviews,
        handleTitleChange,
        handleSlugChange,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        isDragging,
    } = useStep1Basics(
        draft.title,
        draft.slug,
        draft.images,
        ctrl.setTitleAndSlug,
        (slug) => ctrl.setBasics({ slug }),
        ctrl.addImages,
        ctrl.removeImage,
    );

    return (
        <div className="space-y-6 max-w-xl">
            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="e.g. Classic Leather Sneaker"
                    value={draft.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
                <Label htmlFor="slug" className="flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5" />
                    Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center rounded-md border border-input bg-muted/30 px-3 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-xs text-muted-foreground shrink-0 select-none pr-1">
                        /products/
                    </span>
                    <input
                        id="slug"
                        className="flex-1 bg-transparent py-2 text-sm outline-none font-mono"
                        placeholder="classic-leather-sneaker"
                        value={draft.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Auto-generated from title. Edit to override.
                </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Product description…"
                    rows={4}
                    value={draft.description}
                    onChange={(e) => ctrl.setBasics({ description: e.target.value })}
                    className="resize-none"
                />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                    value={draft.category_id || "none"}
                    onValueChange={(v) =>
                        ctrl.setBasics({ category_id: v === "none" ? "" : v })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Images */}
            <div className="space-y-2">
                <Label>
                    Images{" "}
                    <span className="text-muted-foreground text-xs">(max 4)</span>
                </Label>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "flex flex-wrap gap-3 p-2 rounded-lg transition-colors",
                        isDragging && "bg-primary/10 border border-primary"
                    )}
                >
                    {/* imagePreviews is ImagePreview[] — render preview.url, not the object */}
                    {imagePreviews.map((preview, i) => (
                        <div
                            key={i}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group"
                        >
                            <img src={preview.url} alt="" className="w-full h-full object-cover" />

                            {/* Small badge on already-uploaded images */}
                            {preview.isExisting && (
                                <span className="absolute top-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 rounded-bl">
                                    saved
                                </span>
                            )}

                            {/* ctrl.removeImage is in scope via the Pick — no need to thread
                  it through the hook */}
                            <button
                                type="button"
                                onClick={() => ctrl.removeImage(i)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>

                            {i === 0 && (
                                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                    Cover
                                </span>
                            )}
                        </div>
                    ))}

                    {draft.images.length < 4 && (
                        <label
                            className={cn(
                                "w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
                                isDragging
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary hover:bg-muted/40 text-muted-foreground"
                            )}
                        >
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-[10px] mt-1">
                                {isDragging ? "Drop here" : "Add"}
                            </span>

                            {/* File picker calls ctrl.addImages directly — same method
                  the drag-drop handler uses, single source of truth */}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="sr-only"
                                onChange={(e) => ctrl.addImages(e.target.files)}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}