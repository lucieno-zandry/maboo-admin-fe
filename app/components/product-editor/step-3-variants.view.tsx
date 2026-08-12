import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Wand2, Trash2, AlertCircle, ImagePlus, X } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ProductEditorController } from "./product-editor.controller";
import { useStep3Variants } from "./step-3-variants.controller";
import getCurrency from "~/lib/get-currency";
import { isDraftImageExisting } from "~/lib/draft-images-helpers";
import type { ProductDraft } from "~/types/drafts";

type Step3VariantsProps = {
    draft: ProductDraft;
    ctrl: Pick<
        ProductEditorController,
        "applyGeneratedVariants" | "updateVariant" | "removeVariant" | "bulkSetVariants" | 'setVariantImage' | 'removeVariantImage'
    >;
};

export function Step3Variants({ draft, ctrl }: Step3VariantsProps) {
    const {
        getOptionValue,
        groupNames,
        bulkPrice,
        setBulkPrice,
        bulkStock,
        setBulkStock,
    } = useStep3Variants(draft.variants, draft.variantGroups);

    const hasGroups = draft.variantGroups.length > 0;
    const hasVariants = draft.variants.length > 0;

    return (
        <div className="space-y-5">
            {/* Generate button */}
            {hasGroups && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div>
                        <p className="text-sm font-medium">Generate from groups</p>
                        <p className="text-xs text-muted-foreground">
                            Auto-creates one variant per combination of options.
                        </p>
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={ctrl.applyGeneratedVariants}
                        className="gap-2 shrink-0"
                    >
                        <Wand2 className="w-4 h-4" />
                        Generate
                    </Button>
                </div>
            )}

            {/* Bulk fill */}
            {hasVariants && (
                <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-border bg-card">
                    <p className="w-full text-xs font-semibold text-muted-foreground">BULK FILL ALL VARIANTS</p>
                    <div className="space-y-1">
                        <Label className="text-xs">Price ({getCurrency()})</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 12900"
                            className="w-36 h-8"
                            value={bulkPrice}
                            onChange={(e) => setBulkPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Stock</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 10"
                            className="w-28 h-8"
                            value={bulkStock}
                            onChange={(e) => setBulkStock(e.target.value)}
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        onClick={() =>
                            ctrl.bulkSetVariants({
                                ...(bulkPrice ? { price: bulkPrice } : {}),
                                ...(bulkStock ? { stock: bulkStock } : {}),
                            })
                        }
                    >
                        Apply to all
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!hasVariants && (
                <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-border rounded-xl text-muted-foreground gap-3">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm">No variants yet.</p>
                    {hasGroups ? (
                        <p className="text-xs">Click "Generate" above to create variants from your groups.</p>
                    ) : (
                        <p className="text-xs">Go back and add variant groups, or the product will have a single default variant.</p>
                    )}
                </div>
            )}

            {/* Variants table */}
            {hasVariants && (
                <div className="rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/60">
                                    {/* Option columns */}
                                    {draft.variantGroups.map((g) => (
                                        <TableHead key={g.tempId} className="text-xs py-2 font-semibold whitespace-nowrap">
                                            {g.name || "Group"}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-xs py-2 font-semibold">SKU</TableHead>
                                    <TableHead className="text-xs py-2 font-semibold">Price ({getCurrency()})</TableHead>
                                    <TableHead className="text-xs py-2 font-semibold">Special price</TableHead>
                                    <TableHead className="text-xs py-2 font-semibold">Stock</TableHead>
                                    <TableHead className="w-8" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {draft.variants.map((variant) => {
                                    const missingFields =
                                        !variant.sku.trim() || !variant.price || !variant.stock;

                                    return (
                                        <TableRow
                                            key={variant.tempId}
                                            className={cn(missingFields && "bg-amber-50/40 dark:bg-amber-950/20")}
                                        >
                                            {/* Option value cells (read-only badges) */}
                                            {draft.variantGroups.map((g) => (
                                                <TableCell key={g.tempId} className="py-1.5">
                                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                                        {getOptionValue(variant, g.tempId)}
                                                    </span>
                                                </TableCell>
                                            ))}

                                            {/* SKU */}
                                            <TableCell className="py-1.5">
                                                <Input
                                                    value={variant.sku}
                                                    onChange={(e) =>
                                                        ctrl.updateVariant(variant.tempId, { sku: e.target.value })
                                                    }
                                                    className={cn(
                                                        "h-7 text-xs font-mono w-32",
                                                        !variant.sku.trim() && "border-amber-400 focus-visible:ring-amber-400"
                                                    )}
                                                    placeholder="SKU-001"
                                                />
                                            </TableCell>

                                            {/* Price */}
                                            <TableCell className="py-1.5">
                                                <Input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) =>
                                                        ctrl.updateVariant(variant.tempId, { price: e.target.value })
                                                    }
                                                    className={cn(
                                                        "h-7 text-xs w-28",
                                                        !variant.price && "border-amber-400 focus-visible:ring-amber-400"
                                                    )}
                                                    placeholder="12900"
                                                />
                                            </TableCell>

                                            {/* Special price */}
                                            <TableCell className="py-1.5">
                                                <Input
                                                    type="number"
                                                    value={variant.effective_price}
                                                    onChange={(e) =>
                                                        ctrl.updateVariant(variant.tempId, {
                                                            effective_price: e.target.value,
                                                        })
                                                    }
                                                    className="h-7 text-xs w-28"
                                                    placeholder="Optional"
                                                />
                                            </TableCell>

                                            {/* Stock */}
                                            <TableCell className="py-1.5">
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) =>
                                                        ctrl.updateVariant(variant.tempId, { stock: e.target.value })
                                                    }
                                                    className={cn(
                                                        "h-7 text-xs w-20",
                                                        !variant.stock && "border-amber-400 focus-visible:ring-amber-400"
                                                    )}
                                                    placeholder="0"
                                                />
                                            </TableCell>

                                            {/* Image */}
                                            <TableCell className="py-1.5">
                                                <div className="flex items-center gap-1">
                                                    {variant.image ? (
                                                        <div className="relative w-8 h-8 rounded border border-border overflow-hidden group">
                                                            <img
                                                                src={isDraftImageExisting(variant.image) ? variant.image.url : URL.createObjectURL(variant.image)}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onLoad={(e) => {
                                                                    // If it's a File, we created an object URL; we don't revoke it here because we need it.
                                                                    // We'll revoke on cleanup.
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => ctrl.removeVariantImage(variant.tempId)}
                                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                            >
                                                                <X className="w-3 h-3 text-white" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                const input = document.createElement('input');
                                                                input.type = 'file';
                                                                input.accept = 'image/*';
                                                                input.onchange = (e) => {
                                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                                    if (file) ctrl.setVariantImage(variant.tempId, file);
                                                                };
                                                                input.click();
                                                            }}
                                                        >
                                                            <ImagePlus className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Delete */}
                                            <TableCell className="py-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() => ctrl.removeVariant(variant.tempId)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Missing fields warning */}
                    {draft.variants.some((v) => !v.sku.trim() || !v.price || !v.stock) && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            Some variants are incomplete (highlighted in yellow). Fill in all required fields before submitting.
                        </div>
                    )}
                </div>
            )}

            {/* Summary */}
            {hasVariants && (
                <p className="text-xs text-muted-foreground">
                    {draft.variants.length} variant{draft.variants.length !== 1 ? "s" : ""} ·{" "}
                    {draft.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)} units total
                </p>
            )}
        </div>
    );
}