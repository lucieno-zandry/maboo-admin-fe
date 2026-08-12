import type { LandingBlock } from "wle-core";

export const BLOCK_TYPE_LABELS: Record<LandingBlock['block_type'], string> = {
    hero: 'Hero',
    collection_grid: 'Collection Grid',
    featured_products: 'Featured Products',
    story: 'Story',
    comparison: 'Comparison',
    testimonials: 'Testimonials',
    faq: 'FAQ',
    cta_banner: 'CTA Banner',
    trust_bar: 'Trust Bar',
};

export const BLOCK_TYPE_DESCRIPTIONS: Record<LandingBlock['block_type'], string> = {
    hero: 'Full-width banner with headline, subtitle, and call-to-action',
    collection_grid: 'Grid layout showcasing a product collection',
    featured_products: 'Highlight specific products with details',
    story: 'Long-form narrative section with rich content',
    comparison: 'Side-by-side feature comparison table',
    testimonials: 'Customer reviews and social proof',
    faq: 'Frequently asked questions accordion',
    cta_banner: 'Conversion-focused call-to-action strip',
    trust_bar: 'Trust signals: logos, badges, stats',
};

export const BLOCK_TYPE_ICONS: Record<LandingBlock['block_type'], string> = {
    hero: '🖼️',
    collection_grid: '⊞',
    featured_products: '⭐',
    story: '📖',
    comparison: '⚖️',
    testimonials: '💬',
    faq: '❓',
    cta_banner: '📣',
    trust_bar: '🛡️',
};

export const LANDING_ABLE_TYPE_OPTIONS = [
    { value: '-', label: 'None' },
    { value: 'App\\Models\\Product', label: 'Product' },
    { value: 'App\\Models\\Category', label: 'Category' },
    { value: 'App\\Models\\Variant', label: 'Variant' },
    { value: 'App\\Models\\AppImage', label: 'Image' },
] as const;