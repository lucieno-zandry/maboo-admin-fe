// ============================================
// COMPONENT: ProductVariantsTable.tsx (Dumb)
// ============================================
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { getStockStatus, getPromotionBadge } from '../../helpers/product-helpers';
import formatPrice from '~/lib/format-price';
import type { Variant } from 'wle-core';

interface ProductVariantsTableProps {
    variants: Variant[];
}

export const ProductVariantsTable = ({ variants }: ProductVariantsTableProps) => {
    if (!variants || variants.length === 0) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Product Variants</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl bg-muted/30">
                        <p className="text-sm text-muted-foreground">No variants are available for this product.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Product Variants ({variants.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[120px]">SKU</TableHead>
                                <TableHead className="min-w-[150px]">Options</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="w-[200px]">Promotions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant) => {
                                const hasEffectivePrice = variant.effective_price !== undefined && variant.effective_price !== variant.price;
                                const stockStatus = getStockStatus(variant.stock);

                                return (
                                    <TableRow key={variant.id} className="hover:bg-muted/40 transition-colors">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {variant.sku}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {variant.variant_options?.map((opt) => (
                                                    <Badge key={opt.id} variant="outline" className="bg-background">
                                                        {opt.value}
                                                    </Badge>
                                                ))}
                                                {(!variant.variant_options || variant.variant_options.length === 0) && (
                                                    <span className="text-muted-foreground text-xs italic">Default</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end justify-center">
                                                {hasEffectivePrice ? (
                                                    <>
                                                        <span className="text-green-600 font-semibold leading-none mb-1">
                                                            {formatPrice(variant.effective_price!)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground line-through leading-none">
                                                            {formatPrice(variant.price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="font-medium text-foreground">
                                                        {formatPrice(variant.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={stockStatus.variant}
                                                className={`ml-auto ${stockStatus.variant === 'default' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}`}
                                            >
                                                {variant.stock} {stockStatus.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1.5">
                                                {variant.applied_promotions?.map((promo) => (
                                                    <Badge key={promo.id} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                        {promo.name} ({getPromotionBadge(promo)})
                                                    </Badge>
                                                ))}
                                                {(!variant.applied_promotions || variant.applied_promotions.length === 0) && (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};