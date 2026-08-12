import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";
import type {
    FieldErrors,
    FormImageEntry,
    FormVariant,
    FormVariantGroup,
    FormVariantOption,
    ProductFormStep,
} from "../types/product-form-types";
import type { Product } from "wle-core";

// ─── State shape ──────────────────────────────────────────────────────────────

type ProductFormState = {
    // dialog visibility
    open: boolean;
    /** id means update mode */
    editingProductId: number | null;

    // wizard step
    step: ProductFormStep;

    // step 1 – basic metadata
    title: string;
    slug: string;
    description: string;
    category_id: string;
    images: FormImageEntry[];

    // step 2 – variant groups
    variant_groups: FormVariantGroup[];

    // step 3 – variants
    variants: FormVariant[];

    // server error state
    fieldErrors: FieldErrors;
    globalError: string | null;

    // loading
    submitting: boolean;
};

// ─── Actions shape ────────────────────────────────────────────────────────────

type ProductFormActions = {
    // dialog control
    openForCreate: () => void;
    openForEdit: (product: Product) => void;
    close: () => void;

    // navigation
    setStep: (step: ProductFormStep) => void;

    // step 1
    setTitle: (v: string) => void;
    setSlug: (v: string) => void;
    setDescription: (v: string) => void;
    setCategoryId: (v: string) => void;
    addImages: (files: File[]) => void;
    removeImage: (key: string) => void;

    // step 2 – groups
    addVariantGroup: () => void;
    removeVariantGroup: (groupKey: string) => void;
    setGroupName: (groupKey: string, name: string) => void;
    addOption: (groupKey: string) => void;
    removeOption: (groupKey: string, optionKey: string) => void;
    setOptionValue: (groupKey: string, optionKey: string, value: string) => void;

    // step 3 – variants
    generateVariants: () => void;
    addVariant: () => void;
    removeVariant: (variantKey: string) => void;
    setVariantField: (variantKey: string, field: keyof FormVariant, value: any) => void;
    setVariantImage: (variantKey: string, file: File | null) => void;

    // errors
    setFieldErrors: (errors: FieldErrors) => void;
    setGlobalError: (msg: string | null) => void;
    clearErrors: () => void;

    // submission
    setSubmitting: (v: boolean) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_STATE: Omit<ProductFormState, "open" | "editingProductId"> = {
    step: 1,
    title: "",
    slug: "",
    description: "",
    category_id: "",
    images: [],
    variant_groups: [],
    variants: [],
    fieldErrors: {},
    globalError: null,
    submitting: false,
};

function productToFormState(product: Product): Omit<ProductFormState, "open" | "editingProductId"> {
    const images: FormImageEntry[] = (product.images ?? []).map((img) => ({
        id: img.id,
        previewUrl: img.url,
        _key: nanoid(),
    }));

    const variant_groups: FormVariantGroup[] = (product.variant_groups ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        _key: nanoid(),
        options: (g.variant_options ?? []).map((o) => ({
            id: o.id,
            value: o.value,
            _key: nanoid(),
        })),
    }));

    // build a lookup: option.id → _key (so variants can reference by _key)
    const optionIdToKey: Record<number, string> = {};
    variant_groups.forEach((g) => {
        g.options.forEach((o) => {
            if (o.id) optionIdToKey[o.id] = o._key;
        });
    });

    const variants: FormVariant[] = (product.variants ?? []).map((v) => ({
        id: v.id,
        sku: v.sku,
        price: String(v.price),
        stock: String(v.stock),
        option_refs: (v.variant_options ?? [])
            .map((o) => optionIdToKey[o.id])
            .filter(Boolean),
        existing_image_url: v.image?.url ?? null,
        image: null,
        _key: nanoid(),
        weight_kg: v.weight_kg != null ? String(v.weight_kg) : "",
        length_cm: v.length_cm != null ? String(v.length_cm) : "",
        width_cm: v.width_cm != null ? String(v.width_cm) : "",
        height_cm: v.height_cm != null ? String(v.height_cm) : "",
    }));

    return {
        ...EMPTY_STATE,
        title: product.title,
        slug: product.slug,
        description: product.description ?? "",
        category_id: product.category_id ? String(product.category_id) : "",
        images,
        variant_groups,
        variants,
    };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProductFormStore = create<ProductFormState & ProductFormActions>()(
    immer((set, get) => ({
        open: false,
        editingProductId: null,
        ...EMPTY_STATE,

        // ── dialog ──────────────────────────────────────────────────────────────
        openForCreate() {
            set((s) => {
                Object.assign(s, { open: true, editingProductId: null, ...EMPTY_STATE });
            });
        },

        openForEdit(product) {
            set((s) => {
                Object.assign(s, {
                    open: true,
                    editingProductId: product.id,
                    ...productToFormState(product),
                });
            });
        },

        close() {
            set((s) => { s.open = false; });
        },

        // ── navigation ───────────────────────────────────────────────────────────
        setStep(step) {
            set((s) => { s.step = step; });
        },

        // ── step 1 ───────────────────────────────────────────────────────────────
        setTitle(v) { set((s) => { s.title = v; }); },
        setSlug(v) { set((s) => { s.slug = v; }); },
        setDescription(v) { set((s) => { s.description = v; }); },
        setCategoryId(v) { set((s) => { s.category_id = v; }); },

        addImages(files) {
            set((s) => {
                const remaining = 4 - s.images.length;
                files.slice(0, remaining).forEach((file) => {
                    s.images.push({
                        previewUrl: URL.createObjectURL(file),
                        file,
                        _key: nanoid(),
                    });
                });
            });
        },

        removeImage(key) {
            set((s) => {
                const idx = s.images.findIndex((i) => i._key === key);
                if (idx !== -1) s.images.splice(idx, 1);
            });
        },

        // ── step 2 ───────────────────────────────────────────────────────────────
        addVariantGroup() {
            set((s) => {
                s.variant_groups.push({ name: "", options: [], _key: nanoid() });
            });
        },

        removeVariantGroup(groupKey) {
            set((s) => {
                const idx = s.variant_groups.findIndex((g) => g._key === groupKey);
                if (idx !== -1) s.variant_groups.splice(idx, 1);
            });
        },

        setGroupName(groupKey, name) {
            set((s) => {
                const g = s.variant_groups.find((g) => g._key === groupKey);
                if (g) g.name = name;
            });
        },

        addOption(groupKey) {
            set((s) => {
                const g = s.variant_groups.find((g) => g._key === groupKey);
                if (g) g.options.push({ value: "", _key: nanoid() });
            });
        },

        removeOption(groupKey, optionKey) {
            set((s) => {
                const g = s.variant_groups.find((g) => g._key === groupKey);
                if (!g) return;
                const idx = g.options.findIndex((o) => o._key === optionKey);
                if (idx !== -1) g.options.splice(idx, 1);
            });
        },

        setOptionValue(groupKey, optionKey, value) {
            set((s) => {
                const g = s.variant_groups.find((g) => g._key === groupKey);
                if (!g) return;
                const o = g.options.find((o) => o._key === optionKey);
                if (o) o.value = value;
            });
        },

        // ── step 3 ───────────────────────────────────────────────────────────────
        generateVariants() {
            const { variant_groups, variants } = get();

            // collect non-empty options per group
            const groups = variant_groups
                .map((g) => g.options.filter((o) => o.value.trim()).map((o) => o._key))
                .filter((opts) => opts.length > 0);

            if (groups.length === 0) return;

            // cartesian product
            const combos: string[][] = groups.reduce<string[][]>(
                (acc, group) => acc.flatMap((prev) => group.map((opt) => [...prev, opt])),
                [[]]
            );

            // build lookup: option_key → option value for sku suggestion
            const keyToValue: Record<string, string> = {};
            variant_groups.forEach((g) =>
                g.options.forEach((o) => { keyToValue[o._key] = o.value; })
            );

            // keep existing variants that exactly match a combo (by option_refs set equality)
            const existingMap = new Map(
                variants.map((v) => [JSON.stringify([...v.option_refs].sort()), v])
            );

            const newVariants: FormVariant[] = combos.map((combo) => {
                const sortedKey = JSON.stringify([...combo].sort());
                const existing = existingMap.get(sortedKey);
                if (existing) return existing;

                const skuSuffix = combo.map((k) => keyToValue[k]).join("-").toUpperCase();
                return {
                    sku: skuSuffix,
                    price: "",
                    stock: "0",
                    option_refs: combo,
                    image: null,
                    _key: nanoid(),
                    weight_kg: "",
                    length_cm: "",
                    width_cm: "",
                    height_cm: "",
                };
            });

            set((s) => { s.variants = newVariants; });
        },

        addVariant() {
            set((s) => {
                s.variants.push({
                    sku: "",
                    price: "",
                    stock: "0",
                    option_refs: [],
                    image: null,
                    _key: nanoid(),
                    weight_kg: "",
                    length_cm: "",
                    width_cm: "",
                    height_cm: "",
                });
            });
        },

        removeVariant(variantKey) {
            set((s) => {
                const idx = s.variants.findIndex((v) => v._key === variantKey);
                if (idx !== -1) s.variants.splice(idx, 1);
            });
        },

        setVariantField(variantKey, field, value) {
            set((s) => {
                const v = s.variants.find((v) => v._key === variantKey);
                if (v) (v as any)[field] = value;
            });
        },

        setVariantImage(variantKey, file) {
            set((s) => {
                const v = s.variants.find((v) => v._key === variantKey);
                if (v) {
                    v.image = file;
                    if (file) v.existing_image_url = URL.createObjectURL(file);
                    else if (!file) v.existing_image_url = null;
                }
            });
        },

        // ── errors ───────────────────────────────────────────────────────────────
        setFieldErrors(errors) { set((s) => { s.fieldErrors = errors; }); },
        setGlobalError(msg) { set((s) => { s.globalError = msg; }); },
        clearErrors() { set((s) => { s.fieldErrors = {}; s.globalError = null; }); },

        // ── submission ────────────────────────────────────────────────────────────
        setSubmitting(v) { set((s) => { s.submitting = v; }); },
    }))
);