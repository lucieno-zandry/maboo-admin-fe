import { useParams } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { useProduct } from './hooks/use-product';
import { ProductVariantsTable } from './components/detail/product-variants-table';
import { ProductVariantGroups } from './components/detail/product-variants-groups';
import { ProductImagesGallery } from './components/detail/product-images-gallery';
import { ProductDetailSkeleton } from './components/detail/product-detail-skeleton';
import type { Product } from 'wle-core';

// Dumb Component
interface ProductDetailViewProps {
    product: Product;
}

export const ProductDetailView = ({ product }: ProductDetailViewProps) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{product.title}</h1>
                    <p className="text-muted-foreground mt-1">Slug: {product.slug}</p>
                </div>
                {product.category && (
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        {product.category.title}
                    </Badge>
                )}
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{product.description}</p>
                </CardContent>
            </Card>

            {/* Tabs for sections */}
            <Tabs defaultValue="variants">
                <TabsList>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="variant-groups">Variant Groups</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                </TabsList>
                <TabsContent value="variants" className="mt-4">
                    <ProductVariantsTable variants={product.variants || []} />
                </TabsContent>
                <TabsContent value="variant-groups" className="mt-4">
                    <ProductVariantGroups variantGroups={product.variant_groups || []} />
                </TabsContent>
                <TabsContent value="images" className="mt-4">
                    <ProductImagesGallery images={product.images || []} />
                </TabsContent>
            </Tabs>

            {/* Meta Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Meta Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Created At:</span>
                        <span className="ml-2 text-muted-foreground">
                            {new Date(product.created_at).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Updated At:</span>
                        <span className="ml-2 text-muted-foreground">
                            {new Date(product.updated_at).toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">ID:</span>
                        <span className="ml-2 text-muted-foreground">{product.id}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default () => {
    const { slug } = useParams();
    const { data: product, isLoading, error } = useProduct(slug || '');

    if (!slug) return <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">Select a product to view details</div>;
    if (isLoading) return <ProductDetailSkeleton />;
    if (error || !product) return <div className="text-destructive text-center py-10">Failed to load product.</div>;

    return <ProductDetailView product={product} />;
};