// ~/hooks/use-variant-picker-store.ts
import type { Product } from "wle-core";
import { create } from "zustand";
import { getProducts } from "~/api/http-requests";
import type { ProductQueryParams } from "~/lib/serialize-product-params";

// ─── Types ────────────────────────────────────────────────────────────────────

type PickerMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

type VariantPickerState = {
    // Product list
    products: Product[];
    meta: PickerMeta | null;
    loading: boolean;
    error: string | null;

    // Query params
    params: ProductQueryParams;

    // UI: which product rows are expanded
    expandedProductIds: Set<number>;

    // Selection:
    // - selectedVariantIds: the flat set of all chosen variant IDs
    selectedVariantIds: Set<number>;
};

type VariantPickerActions = {
    // Data
    loadProducts: (params?: ProductQueryParams) => Promise<void>;
    setParams: (params: Partial<ProductQueryParams>) => void;

    // Expansion
    toggleExpand: (productId: number) => void;
    expandAll: () => void;
    collapseAll: () => void;

    // Selection — variant level
    toggleVariant: (variantId: number) => void;
    selectVariant: (variantId: number) => void;
    deselectVariant: (variantId: number) => void;

    // Selection — product level (all-or-nothing for a whole product's variants)
    toggleProduct: (product: Product) => void;
    selectAllVariantsOfProduct: (product: Product) => void;
    deselectAllVariantsOfProduct: (product: Product) => void;

    // Bulk helpers
    selectAll: () => void;       // all variants of all loaded products
    clearSelection: () => void;

    // Derived helpers (called in components)
    getProductSelectionState: (
        product: Product
    ) => "none" | "partial" | "all";

    // Reset everything (call when closing dialog)
    reset: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function variantIdsOf(product: Product): number[] {
    return product.variants?.map((v) => v.id) ?? [];
}

// ─── Initial state ────────────────────────────────────────────────────────────

const defaultParams: ProductQueryParams = {
    page: 1,
    limit: 10,
    order_by: "created_at",
    direction: "DESC",
    with: ["variants.variant_options.variant_group", "images", "category"],
};

const initialState: VariantPickerState = {
    products: [],
    meta: null,
    loading: false,
    error: null,
    params: defaultParams,
    expandedProductIds: new Set(),
    selectedVariantIds: new Set(),
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useVariantPickerStore = create<
    VariantPickerState & VariantPickerActions
>((set, get) => ({
    ...initialState,

    // ── Data ───────────────────────────────────────────────────────────────

    setParams: (params) =>
        set((s) => ({ params: { ...s.params, ...params } })),

    loadProducts: async (overrides?) => {
        const params = { ...get().params, ...overrides };
        set({ loading: true, error: null });
        try {
            const res = await getProducts(params);
            const data = res.data!;
            set({
                products: data.data,
                meta: {
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                    from: data.from || 0,
                    to: data.to || 0,
                },
                loading: false,
                params,
                // Auto-expand all loaded products so variants are visible immediately
                expandedProductIds: new Set(data.data.map((p) => p.id)),
            });
        } catch (e: any) {
            set({ error: e?.message ?? "Failed to load products", loading: false });
        }
    },

    // ── Expansion ──────────────────────────────────────────────────────────

    toggleExpand: (productId) =>
        set((s) => {
            const next = new Set(s.expandedProductIds);
            next.has(productId) ? next.delete(productId) : next.add(productId);
            return { expandedProductIds: next };
        }),

    expandAll: () =>
        set((s) => ({
            expandedProductIds: new Set(s.products.map((p) => p.id)),
        })),

    collapseAll: () => set({ expandedProductIds: new Set() }),

    // ── Variant selection ──────────────────────────────────────────────────

    toggleVariant: (variantId) =>
        set((s) => {
            const next = new Set(s.selectedVariantIds);
            next.has(variantId) ? next.delete(variantId) : next.add(variantId);
            return { selectedVariantIds: next };
        }),

    selectVariant: (variantId) =>
        set((s) => ({
            selectedVariantIds: new Set([...s.selectedVariantIds, variantId]),
        })),

    deselectVariant: (variantId) =>
        set((s) => {
            const next = new Set(s.selectedVariantIds);
            next.delete(variantId);
            return { selectedVariantIds: next };
        }),

    // ── Product-level selection ────────────────────────────────────────────

    toggleProduct: (product) => {
        const { selectedVariantIds, getProductSelectionState } = get();
        const state = getProductSelectionState(product);
        const ids = variantIdsOf(product);

        if (state === "all") {
            // Deselect all
            const next = new Set(selectedVariantIds);
            ids.forEach((id) => next.delete(id));
            set({ selectedVariantIds: next });
        } else {
            // Select all
            const next = new Set(selectedVariantIds);
            ids.forEach((id) => next.add(id));
            set({ selectedVariantIds: next });
        }
    },

    selectAllVariantsOfProduct: (product) => {
        const ids = variantIdsOf(product);
        set((s) => ({
            selectedVariantIds: new Set([...s.selectedVariantIds, ...ids]),
        }));
    },

    deselectAllVariantsOfProduct: (product) => {
        const ids = new Set(variantIdsOf(product));
        set((s) => ({
            selectedVariantIds: new Set(
                [...s.selectedVariantIds].filter((id) => !ids.has(id))
            ),
        }));
    },

    // ── Bulk ───────────────────────────────────────────────────────────────

    selectAll: () =>
        set((s) => ({
            selectedVariantIds: new Set(
                s.products.flatMap((p) => variantIdsOf(p))
            ),
        })),

    clearSelection: () => set({ selectedVariantIds: new Set() }),

    // ── Derived ────────────────────────────────────────────────────────────

    getProductSelectionState: (product) => {
        const { selectedVariantIds } = get();
        const ids = variantIdsOf(product);
        if (ids.length === 0) return "none";
        const selectedCount = ids.filter((id) => selectedVariantIds.has(id)).length;
        if (selectedCount === 0) return "none";
        if (selectedCount === ids.length) return "all";
        return "partial";
    },

    // ── Reset ──────────────────────────────────────────────────────────────

    reset: () => set({ ...initialState, params: defaultParams }),
}));