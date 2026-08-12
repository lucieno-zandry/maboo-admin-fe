import type { ProductDraft } from "~/types/drafts";
import { isDraftImageExisting, isDraftImageNew } from "./draft-images-helpers";

/**
 * Builds FormData for POST /product/full-create.
 */
export function buildFullCreateFormData(draft: ProductDraft): FormData {
  const fd = new FormData();

  fd.append("title", draft.title.trim());
  fd.append("slug", draft.slug.trim());
  if (draft.description) fd.append("description", draft.description.trim());
  if (draft.category_id) fd.append("category_id", draft.category_id);

  draft.images.forEach((img) => {
    if (isDraftImageNew(img)) fd.append("images[]", img);
  });

  draft.variantGroups.forEach((group, gi) => {
    fd.append(`variant_groups[${gi}][name]`, group.name.trim());
    group.options.forEach((opt, oi) => {
      fd.append(`variant_groups[${gi}][options][${oi}][value]`, opt.value.trim());
    });
  });

  draft.variants.forEach((variant, vi) => {
    fd.append(`variants[${vi}][sku]`, variant.sku.trim());
    fd.append(`variants[${vi}][price]`, variant.price);
    if (variant.effective_price)
      fd.append(`variants[${vi}][effective_price]`, variant.effective_price);
    fd.append(`variants[${vi}][stock]`, variant.stock);

    if (variant.image && isDraftImageNew(variant.image)) {
      fd.append(`variants[${vi}][image]`, variant.image);
    }

    variant.optionRefs.forEach((ref, ri) => {
      const group = draft.variantGroups.find((g) => g.tempId === ref.groupTempId);
      const option = group?.options.find((o) => o.tempId === ref.optionTempId);
      if (group && option) {
        fd.append(
          `variants[${vi}][option_refs][${ri}]`,
          `${group.name.trim()}:${option.value.trim()}`
        );
      }
    });
  });

  return fd;
}

/**
 * Builds FormData for PUT /product/{id}/full-update.
 *
 * Strategy: send the DESIRED FINAL STATE. The backend diffs against its DB.
 *
 *   existing_image_ids[]               IDs of AppImages to KEEP (omitted = deleted)
 *   images[]                           New file uploads to add
 *
 *   variant_groups[i][id]              Present only for existing groups
 *   variant_groups[i][name]
 *   variant_groups[i][options][j][id]  Present only for existing options
 *   variant_groups[i][options][j][value]
 *
 *   variants[k][id]                    Present only for existing variants
 *   variants[k][sku/price/stock/...]
 *   variants[k][option_refs][]         "GroupName:OptionValue" strings
 *
 * Anything in the DB not referenced by id will be deleted server-side.
 */
export function buildFullUpdateFormData(draft: ProductDraft): FormData {
  const fd = new FormData();

  fd.append("title", draft.title.trim());
  fd.append("slug", draft.slug.trim());
  fd.append("description", draft.description?.trim() ?? "");
  if (draft.category_id) fd.append("category_id", draft.category_id);

  draft.images.forEach((img) => {
    if (isDraftImageExisting(img)) {
      fd.append("existing_image_ids[]", String(img.id));
    } else if (isDraftImageNew(img)) {
      fd.append("images[]", img);
    }
  });

  draft.variantGroups.forEach((group, gi) => {
    if (!group.isNew) fd.append(`variant_groups[${gi}][id]`, group.tempId);
    fd.append(`variant_groups[${gi}][name]`, group.name.trim());

    group.options.forEach((opt, oi) => {
      if (!opt.isNew) fd.append(`variant_groups[${gi}][options][${oi}][id]`, opt.tempId);
      fd.append(`variant_groups[${gi}][options][${oi}][value]`, opt.value.trim());
    });
  });

  draft.variants.forEach((variant, vi) => {
    if (!variant.isNew) fd.append(`variants[${vi}][id]`, variant.tempId);
    fd.append(`variants[${vi}][sku]`, variant.sku.trim());
    fd.append(`variants[${vi}][price]`, variant.price);
    if (variant.effective_price)
      fd.append(`variants[${vi}][effective_price]`, variant.effective_price);
    fd.append(`variants[${vi}][stock]`, variant.stock);

    // Image handling
    if (variant.image) {
      if (isDraftImageNew(variant.image)) {
        fd.append(`variants[${vi}][image]`, variant.image);  // new file
      }
      // if existing (AppImage) – do nothing (keep)
    } else {
      // Explicit removal: send empty string (will become null after backend transformation)
      fd.append(`variants[${vi}][image]`, '');
    }

    variant.optionRefs.forEach((ref, ri) => {
      const group = draft.variantGroups.find((g) => g.tempId === ref.groupTempId);
      const option = group?.options.find((o) => o.tempId === ref.optionTempId);
      if (group && option) {
        fd.append(
          `variants[${vi}][option_refs][${ri}]`,
          `${group.name.trim()}:${option.value.trim()}`
        );
      }
    });
  });

  return fd;
}