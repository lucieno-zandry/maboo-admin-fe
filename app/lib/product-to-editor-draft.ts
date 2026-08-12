import type { Product } from "wle-core";
import type { DraftVariant, DraftVariantOptionRef, ProductDraft } from "~/types/drafts";

/**
 * Maps a Product from the API into the ProductDraft shape used by the editor.
 *
 * Key decisions:
 *  - Existing entity IDs are stored in tempId (as strings).
 *  - isNew is false/undefined for all entities (they exist in the DB).
 *  - Images come in as AppImage objects (not Files), so isDraftImageExisting()
 *    returns true for them — they'll be sent as existing_image_ids[] on update.
 *  - Variant optionRefs: we look up which variant_group + variant_option each
 *    option belongs to, then map to { groupTempId, optionTempId } using the
 *    real IDs cast to strings.
 */
export function productToEditorDraft(product: Product): ProductDraft {
    // Build a flat lookup: option.id -> { groupId }
    // so we can reconstruct optionRefs from variant.variant_options
    const optionGroupMap = new Map<number, number>(); // optionId -> groupId
    product.variant_groups?.forEach((g) => {
        g.variant_options?.forEach((o) => {
            optionGroupMap.set(o.id, g.id);
        });
    });

    const variants: DraftVariant[] = (product.variants ?? []).map((variant) => {
        const optionRefs: DraftVariantOptionRef[] = (
            variant.variant_options ?? []
        ).map((opt) => {
            const groupId = optionGroupMap.get(opt.id);
            return {
                groupTempId: String(groupId ?? ""),
                optionTempId: String(opt.id),
            };
        });

        return {
            tempId: String(variant.id),
            sku: variant.sku,
            price: String(variant.price),
            effective_price: variant.effective_price !== null ? String(variant.effective_price) : "",
            stock: String(variant.stock),
            optionRefs,
            isNew: false,
            image: variant.image ? {
                id: variant.image.id,
                url: variant.image.url,
                width: variant.image.width,
                height: variant.image.height
            } : null,
        };
    });

    return {
        title: product.title,
        slug: product.slug,
        description: product.description ?? "",
        category_id: product.category_id ? String(product.category_id) : "",

        // AppImage objects — isDraftImageExisting() returns true for these
        images: product.images ?? [],

        variantGroups: (product.variant_groups ?? []).map((g) => ({
            tempId: String(g.id),
            name: g.name,
            isNew: false,
            options: (g.variant_options ?? []).map((o) => ({
                tempId: String(o.id),
                value: o.value,
                isNew: false,
            })),
        })),

        variants,
    };
}