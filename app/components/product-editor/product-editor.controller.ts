import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { createFullProduct, updateFullProduct } from "~/api/http-requests";
import useProductEditorSheet from "~/hooks/use-product-editor-sheet";
import { useRefetchProducts } from "~/hooks/use-product-list-store";
import useRouterStore from "~/hooks/use-router-store";
import { buildFullCreateFormData, buildFullUpdateFormData } from "~/lib/build-formdata";
import { productToEditorDraft } from "~/lib/product-to-editor-draft";
import type { DraftOption, DraftVariant, DraftVariantGroup, DraftVariantOptionRef, ProductDraft } from "~/types/drafts";


// --- helpers -----------------------------------------------------------------

let _id = 0;
const uid = (prefix: string) => `${prefix}_${++_id}`;

function randomString(length: number): string {
  return Array.from({ length }, () => Math.random().toString(36)[2]).join("");
}

function emptyDraft(): ProductDraft {
  return {
    title: "",
    slug: "",
    description: "",
    category_id: "",
    images: [],
    variantGroups: [],
    variants: [],
  };
}

export type Step = 1 | 2 | 3;
export type EditorMode = "create" | "edit";

// --- hook --------------------------------------------------------------------

/**
 * Unified editor hook for both creating and editing products.
 *
 * - Pass no product (or undefined) for create mode.
 * - Pass an existing Product for edit mode. The hook populates the draft
 *   from the product on mount and switches the submit path accordingly.
 */
export function useProductEditor() {
  const { setOpen, open, product } = useProductEditorSheet();
  const navigate = useNavigate();
  const defaultDraft = emptyDraft();
  const refetchProducts = useRefetchProducts();

  const mode: EditorMode = product ? "edit" : "create";

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<ProductDraft>(defaultDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Stable slug prefix — only matters in create mode
  const slugPrefix = useRef<string>(randomString(8));

  // Re-populate draft if the product prop changes (e.g. after a refetch)
  useEffect(() => {
    if (product) setDraft(productToEditorDraft(product));
    if (!open) {
      setDraft(defaultDraft)
      setStep(1);
    };
  }, [product?.id, open]); // only re-run when the product ID changes

  // --- Step navigation -------------------------------------------------------

  const goTo = (s: Step) => setStep(s);
  const goNext = () => setStep((s) => Math.min(s + 1, 3) as Step);
  const goPrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  // --- Step 1: basics --------------------------------------------------------

  const setBasics = useCallback(
    (fields: Partial<Pick<ProductDraft, "title" | "slug" | "description" | "category_id">>) => {
      setDraft((d) => ({ ...d, ...fields }));
    },
    []
  );

  /**
   * In CREATE mode: auto-derives slug with a stable random prefix.
   * In EDIT mode: only updates the title, leaves slug untouched
   * (slug changes on existing products are intentional and done via setBasics).
   */
  const setTitleAndSlug = useCallback(
    (title: string) => {
      if (mode === "create") {
        const titleSlug = title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const slug = titleSlug
          ? `${slugPrefix.current}-${titleSlug}`
          : slugPrefix.current;
        setDraft((d) => ({ ...d, title, slug }));
      } else {
        // In edit mode, don't silently clobber a slug the user may have set
        setDraft((d) => ({ ...d, title }));
      }
    },
    [mode]
  );

  // --- Images ----------------------------------------------------------------

  /**
   * Add new File images. Respects the 4-image cap including existing ones.
   */
  const addImages = useCallback((files: FileList | null) => {
    if (!files) return;
    setDraft((d) => {
      const remaining = 4 - d.images.length;
      if (remaining <= 0) return d;
      const incoming = Array.from(files).slice(0, remaining);
      return { ...d, images: [...d.images, ...incoming] };
    });
  }, []);

  /**
   * Remove an image by index.
   * If it's an existing AppImage it simply drops from the array —
   * since we send existing_image_ids[] on update, the backend will
   * detect its absence and delete it.
   */
  const removeImage = useCallback((index: number) => {
    setDraft((d) => ({ ...d, images: d.images.filter((_, i) => i !== index) }));
  }, []);

  const reorderImages = useCallback((from: number, to: number) => {
    setDraft((d) => {
      const imgs = [...d.images];
      const [moved] = imgs.splice(from, 1);
      imgs.splice(to, 0, moved);
      return { ...d, images: imgs };
    });
  }, []);

  // --- Step 2: variant groups ------------------------------------------------

  const addGroup = useCallback(() => {
    const newGroup: DraftVariantGroup = {
      tempId: uid("grp"),
      name: "",
      options: [],
      isNew: true,
    };
    setDraft((d) => ({ ...d, variantGroups: [...d.variantGroups, newGroup] }));
  }, []);

  const updateGroupName = useCallback((groupTempId: string, name: string) => {
    setDraft((d) => ({
      ...d,
      variantGroups: d.variantGroups.map((g) =>
        g.tempId === groupTempId ? { ...g, name } : g
      ),
    }));
  }, []);

  /**
   * Remove a group. Cascades: also removes all variants that referenced
   * any option in this group. The backend will mirror this cascade.
   */
  const removeGroup = useCallback((groupTempId: string) => {
    setDraft((d) => ({
      ...d,
      variantGroups: d.variantGroups.filter((g) => g.tempId !== groupTempId),
      variants: d.variants.filter(
        (v) => !v.optionRefs.some((r) => r.groupTempId === groupTempId)
      ),
    }));
  }, []);

  const addOption = useCallback((groupTempId: string) => {
    const newOpt: DraftOption = { tempId: uid("opt"), value: "", isNew: true };
    setDraft((d) => ({
      ...d,
      variantGroups: d.variantGroups.map((g) =>
        g.tempId === groupTempId
          ? { ...g, options: [...g.options, newOpt] }
          : g
      ),
    }));
  }, []);

  const updateOption = useCallback(
    (groupTempId: string, optionTempId: string, value: string) => {
      setDraft((d) => ({
        ...d,
        variantGroups: d.variantGroups.map((g) =>
          g.tempId === groupTempId
            ? {
              ...g,
              options: g.options.map((o) =>
                o.tempId === optionTempId ? { ...o, value } : o
              ),
            }
            : g
        ),
      }));
    },
    []
  );

  /**
   * Remove an option. Cascades: removes variants that referenced this option.
   */
  const removeOption = useCallback(
    (groupTempId: string, optionTempId: string) => {
      setDraft((d) => ({
        ...d,
        variantGroups: d.variantGroups.map((g) =>
          g.tempId === groupTempId
            ? { ...g, options: g.options.filter((o) => o.tempId !== optionTempId) }
            : g
        ),
        variants: d.variants.filter(
          (v) =>
            !v.optionRefs.some(
              (r) => r.groupTempId === groupTempId && r.optionTempId === optionTempId
            )
        ),
      }));
    },
    []
  );

  // --- Step 3: variants ------------------------------------------------------

  /**
   * Cartesian product of all options across groups.
   * Non-destructive: re-running preserves already-filled existing variants.
   */
  const generateVariants = useCallback((currentDraft: ProductDraft) => {
    const groups = currentDraft.variantGroups.filter((g) => g.options.length > 0);

    if (!groups.length) {
      const existing = currentDraft.variants.find((v) => !v.optionRefs.length);
      return [
        existing ?? {
          tempId: uid("var"),
          sku: "",
          price: "",
          effective_price: "",
          stock: "",
          optionRefs: [],
          isNew: true,
        },
      ];
    }

    type Combo = DraftVariantOptionRef[];
    let combos: Combo[] = [[]];
    for (const group of groups) {
      const next: Combo[] = [];
      for (const combo of combos) {
        for (const opt of group.options) {
          next.push([...combo, { groupTempId: group.tempId, optionTempId: opt.tempId }]);
        }
      }
      combos = next;
    }

    return combos.map((refs) => {
      const existing = currentDraft.variants.find(
        (v) =>
          v.optionRefs.length === refs.length &&
          refs.every((r) =>
            v.optionRefs.some(
              (vr) =>
                vr.groupTempId === r.groupTempId &&
                vr.optionTempId === r.optionTempId
            )
          )
      );
      if (existing) return existing;

      const optLabels = refs.map((r) => {
        const g = currentDraft.variantGroups.find((g) => g.tempId === r.groupTempId);
        const o = g?.options.find((o) => o.tempId === r.optionTempId);
        return o?.value?.toUpperCase().slice(0, 3) ?? "?";
      });
      const skuBase = currentDraft.title
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4);

      return {
        tempId: uid("var"),
        sku: [skuBase, ...optLabels].filter(Boolean).join("-"),
        price: "",
        effective_price: "",
        stock: "",
        optionRefs: refs,
        isNew: true,
        image: null,
      } satisfies DraftVariant;
    });
  }, []);

  const setVariantImage = useCallback((variantTempId: string, file: File | null) => {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v) =>
        v.tempId === variantTempId ? { ...v, image: file } : v
      ),
    }));
  }, []);

  const removeVariantImage = useCallback((variantTempId: string) => {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v) =>
        v.tempId === variantTempId ? { ...v, image: null } : v
      ),
    }));
  }, []);

  const applyGeneratedVariants = useCallback(() => {
    setDraft((d) => ({ ...d, variants: generateVariants(d) }));
  }, [generateVariants]);

  const updateVariant = useCallback(
    (
      variantTempId: string,
      fields: Partial<Pick<DraftVariant, "sku" | "price" | "effective_price" | "stock">>
    ) => {
      setDraft((d) => ({
        ...d,
        variants: d.variants.map((v) =>
          v.tempId === variantTempId ? { ...v, ...fields } : v
        ),
      }));
    },
    []
  );

  const removeVariant = useCallback((variantTempId: string) => {
    setDraft((d) => ({
      ...d,
      variants: d.variants.filter((v) => v.tempId !== variantTempId),
    }));
  }, []);

  const bulkSetVariants = useCallback(
    (fields: Partial<Pick<DraftVariant, "price" | "effective_price" | "stock">>) => {
      setDraft((d) => ({
        ...d,
        variants: d.variants.map((v) => ({ ...v, ...fields })),
      }));
    },
    []
  );

  // --- Validation ------------------------------------------------------------

  const step1Valid =
    draft.title.trim().length >= 2 && draft.slug.trim().length >= 2;

  const step2Valid = draft.variantGroups.every(
    (g) =>
      g.name.trim().length >= 2 &&
      g.options.length > 0 &&
      g.options.every((o) => o.value.trim().length >= 1)
  );

  const step3Valid =
    draft.variants.length > 0 &&
    draft.variants.every(
      (v) => v.sku.trim().length >= 2 && v.price !== "" && v.stock !== ""
    );

  const { lang } = useRouterStore();

  // --- Submit ----------------------------------------------------------------

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (mode === "create") {
        const fd = buildFullCreateFormData(draft);
        const result = await createFullProduct(fd);
        await refetchProducts();
        toast.success('Product created successfuly!')
        navigate(`/${lang}/products/${result.data?.product.slug}`);
      } else {
        const fd = buildFullUpdateFormData(draft);
        const result = await updateFullProduct(product!.id, fd);
        await refetchProducts();
        toast.success('Product updated successfuly!')
        navigate(`/${lang}/products/${result.data?.product.slug}`);
      }

      setOpen(false);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, mode, navigate, product]);

  return {
    mode,
    step,
    draft,
    goTo,
    goNext,
    goPrev,
    // basics
    setTitleAndSlug,
    setBasics,
    // images
    addImages,
    removeImage,
    reorderImages,
    // groups
    addGroup,
    updateGroupName,
    removeGroup,
    addOption,
    updateOption,
    removeOption,
    // variants
    applyGeneratedVariants,
    updateVariant,
    removeVariant,
    bulkSetVariants,
    // meta
    step1Valid,
    step2Valid,
    step3Valid,
    isSubmitting,
    submitError,
    submit,
    setVariantImage,
    removeVariantImage
  };
}

export type ProductEditorController = ReturnType<typeof useProductEditor>;