import type { AppImage } from "wle-core";

export type DraftImage = AppImage | File;

// ── Variant draft types ──────────────────────────────────────────────────────

export type DraftOption = {
    tempId: string;  // real id (as string) for existing, uid() for new
    value: string;
    isNew?: boolean;
};

export type DraftVariantGroup = {
    tempId: string;
    name: string;
    options: DraftOption[];
    isNew?: boolean;
};

export type DraftVariantOptionRef = {
    groupTempId: string;
    optionTempId: string;
};

export type DraftVariant = {
    tempId: string;
    sku: string;
    price: string;
    effective_price: string;
    stock: string;
    optionRefs: DraftVariantOptionRef[];
    isNew?: boolean;
    image?: DraftImage | null;
};

// ── The full product draft ───────────────────────────────────────────────────

export type ProductDraft = {
    // Step 1
    title: string;
    slug: string;
    description: string;
    category_id: string;

    // Mixed: existing AppImages + new File uploads
    images: DraftImage[];

    // Step 2
    variantGroups: DraftVariantGroup[];

    // Step 3
    variants: DraftVariant[];
};