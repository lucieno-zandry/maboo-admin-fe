// ============================================
// COMPONENT: ProductImagesGallery.tsx (Dumb)
// ============================================
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';
import type { AppImage } from 'wle-core';

interface ProductImagesGalleryProps {
    images: AppImage[];
}

export const ProductImagesGallery = ({ images }: ProductImagesGalleryProps) => {
    if (!images || images.length === 0) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Images</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center border-t border-dashed m-4 rounded-xl">
                    <div className="bg-muted p-4 rounded-full mb-3">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground">No images found</h3>
                    <p className="text-sm text-muted-foreground mt-1">This product currently has no images.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Images ({images.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative aspect-square rounded-xl overflow-hidden border bg-muted"
                        >
                            <img
                                src={image.url}
                                alt={`Product image ${image.id}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};