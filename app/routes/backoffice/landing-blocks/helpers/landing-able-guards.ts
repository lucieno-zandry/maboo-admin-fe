// ============================================================================
// LandingAble Type Guards
// ============================================================================
// These helpers determine which model is actually used in the polymorphic
// `landing_able` relation, allowing the UI to render contextual info.

import type { AppImage, Category, LandingAble, Product, Variant } from "wle-core";

export function isProduct(able: LandingAble): able is Product {
    if (!able) return false;
    return (
        'slug' in able &&
        'title' in able &&
        'description' in able &&
        !('sku' in able) &&
        !('url' in able)
    );
}

export function isVariant(able: LandingAble): able is Variant {
    if (!able) return false;
    return 'sku' in able && 'price' in able && 'stock' in able && 'product_id' in able;
}

export function isCategory(able: LandingAble): able is Category {
    if (!able) return false;
    return (
        'title' in able &&
        !('slug' in able) &&
        !('sku' in able) &&
        !('url' in able)
    );
}

export function isAppImage(able: LandingAble): able is AppImage {
    if (!able) return false;
    return 'url' in able && 'width' in able && 'height' in able;
}

// ============================================================================
// LandingAble Display Helpers
// ============================================================================

export function getLandingAbleLabel(able: LandingAble): string {
    if (!able) return '—';
    if (isProduct(able)) return able.title;
    if (isVariant(able)) return `SKU: ${able.sku}`;
    if (isCategory(able)) return able.title;
    if (isAppImage(able)) return `Image #${able.id}`;
    return '—';
}

export function getLandingAbleType(able: LandingAble): string {
    if (!able) return 'None';
    if (isProduct(able)) return 'Product';
    if (isVariant(able)) return 'Variant';
    if (isCategory(able)) return 'Category';
    if (isAppImage(able)) return 'Image';
    return 'Unknown';
}

export function getLandingAbleThumbnail(able: LandingAble): string | null {
    if (!able) return null;
    if (isProduct(able)) return able.images?.[0]?.url ?? null;
    if (isVariant(able)) return able.image?.url ?? null;
    if (isAppImage(able)) return able.url;
    return null;
}

export function getLandingAbleMeta(able: LandingAble): string {
    if (!able) return '';
    if (isProduct(able)) {
        const variantCount = able.variants?.length ?? 0;
        return able.category?.title
            ? `${able.category.title} · ${variantCount} variant${variantCount !== 1 ? 's' : ''}`
            : `${variantCount} variant${variantCount !== 1 ? 's' : ''}`;
    }
    if (isVariant(able)) {
        return `$${able.price.toFixed(2)} · ${able.stock} in stock`;
    }
    if (isCategory(able)) {
        return able.parent_id ? `Sub-category` : 'Root category';
    }
    if (isAppImage(able)) {
        return `${able.width}×${able.height}px`;
    }
    return '';
}