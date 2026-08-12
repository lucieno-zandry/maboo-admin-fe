import type { Product } from 'wle-core';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export const ProductDetailMeta = ({ product }: { product: Product }) => (
    <Card>
        <CardHeader>
            <CardTitle>Meta Information</CardTitle>[cite: 9]
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <span className="font-medium">Created At:</span>
                <span className="ml-2 text-muted-foreground">
                    {new Date(product.created_at).toLocaleString()}[cite: 9]
                </span>
            </div>
            <div>
                <span className="font-medium">Updated At:</span>
                <span className="ml-2 text-muted-foreground">
                    {new Date(product.updated_at).toLocaleString()}[cite: 9]
                </span>
            </div>
            <div>
                <span className="font-medium">ID:</span>
                <span className="ml-2 text-muted-foreground">{product.id}</span>[cite: 9]
            </div>
        </CardContent>
    </Card>
);