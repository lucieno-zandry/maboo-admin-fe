// ============================================
// COMPONENT: ProductVariantGroups.tsx (Dumb)
// ============================================
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Layers } from 'lucide-react';
import type { VariantGroup } from 'wle-core';

interface ProductVariantGroupsProps {
    variantGroups: VariantGroup[];
}

export const ProductVariantGroups = ({ variantGroups }: ProductVariantGroupsProps) => {
    if (!variantGroups || variantGroups.length === 0) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="w-5 h-5 text-muted-foreground" />
                        Variant Groups
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-xl bg-muted/30">
                        <p className="text-sm text-muted-foreground">No variant groups configured for this product.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-muted-foreground" />
                    Variant Groups
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variantGroups.map((group) => (
                        <div key={group.id} className="border rounded-xl p-5 bg-card shadow-sm transition-all hover:shadow-md">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                {group.name}
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {group.variant_options?.map((option) => (
                                    <Badge
                                        key={option.id}
                                        variant="secondary"
                                        className="px-3 py-1 font-medium bg-muted hover:bg-muted/80"
                                    >
                                        {option.value}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};