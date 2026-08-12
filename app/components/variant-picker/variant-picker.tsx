// ~/components/variant-picker/variant-picker.tsx
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { Package, SearchX } from "lucide-react";
import { VariantPickerToolbar } from "./variant-picker-toolbar";
import { VariantPickerProductRow } from "./variant-picker-product-row";
import { VariantPickerFooter } from "./variant-picker-footer";
import type { ProductQueryParams } from "~/lib/serialize-product-params";
import type { Category, Product } from "wle-core";

// ── Loading skeleton ───────────────────────────────────────────────────────────

function ProductRowSkeleton() {
  return (
    <div className="rounded-xl border p-3 flex items-center gap-3">
      <div className="h-4 w-4 rounded border bg-muted" />
      <div className="h-3.5 w-3.5 rounded bg-muted" />
      <div className="h-9 w-9 rounded-md bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="h-5 w-8 rounded-full bg-muted" />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type VariantPickerProps = {
  // Data
  products: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  } | null;
  loading: boolean;

  // Toolbar
  search: string;
  onSearchChange: (v: string) => void;

  categoryId: string;
  categories: Category[];
  onCategoryChange: (v: string) => void;

  sortBy: ProductQueryParams["order_by"]; // "created_at" | "title"
  sortOrder: ProductQueryParams["direction"]; // "ASC" | "DESC"
  onSortByChange: (v: ProductQueryParams["order_by"]) => void;
  onSortOrderChange: (v: ProductQueryParams["direction"]) => void;

  perPage: number; // corresponds to API's `limit`
  onPerPageChange: (v: number) => void;

  onExpandAll: () => void;
  onCollapseAll: () => void;

  // Product rows
  expandedProductIds: Set<number>;
  selectedVariantIds: Set<number>;
  alreadyAssignedVariantIds: Set<number>;

  onToggleExpand: (productId: number) => void;
  onToggleProduct: (product: Product) => void;
  onToggleVariant: (variantId: number) => void;
  getProductSelectionState: (product: Product) => "none" | "partial" | "all";

  // Footer
  onPageChange: (page: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;

  onConfirm: () => void;
  confirming: boolean;
  confirmLabel?: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function VariantPicker({
  products,
  meta,
  loading,
  search,
  onSearchChange,
  categoryId,
  categories,
  onCategoryChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  perPage,
  onPerPageChange,
  onExpandAll,
  onCollapseAll,
  expandedProductIds,
  selectedVariantIds,
  alreadyAssignedVariantIds,
  onToggleExpand,
  onToggleProduct,
  onToggleVariant,
  getProductSelectionState,
  onPageChange,
  onSelectAll,
  onClearSelection,
  onConfirm,
  confirming,
  confirmLabel,
}: VariantPickerProps) {
  const totalVariantsOnPage = products.reduce(
    (sum, p) => sum + (p.variants?.length ?? 0),
    0
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <VariantPickerToolbar
        search={search}
        onSearchChange={onSearchChange}
        categoryId={categoryId}
        categories={categories}
        onCategoryChange={onCategoryChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={onSortByChange}
        onSortOrderChange={onSortOrderChange}
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
        loading={loading}
      />

      {/* Product list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductRowSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              {search ? (
                <>
                  <SearchX className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-sm">No products match "{search}"</p>
                  <button
                    onClick={() => onSearchChange("")}
                    className="text-xs text-primary mt-1 hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <Package className="h-8 w-8 mb-3 opacity-30" />
                  <p className="text-sm">No products found</p>
                </>
              )}
            </div>
          ) : (
            products.map((product) => (
              <VariantPickerProductRow
                key={product.id}
                product={product}
                isExpanded={expandedProductIds.has(product.id)}
                selectionState={getProductSelectionState(product)}
                selectedVariantIds={selectedVariantIds}
                alreadyAssignedVariantIds={alreadyAssignedVariantIds}
                onToggleExpand={() => onToggleExpand(product.id)}
                onToggleProduct={(e) => {
                  e.stopPropagation();
                  onToggleProduct(product);
                }}
                onToggleVariant={onToggleVariant}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <VariantPickerFooter
        meta={meta}
        onPageChange={onPageChange}
        loading={loading}
        selectedCount={selectedVariantIds.size}
        onClearSelection={onClearSelection}
        onSelectAll={onSelectAll}
        totalVariantsOnPage={totalVariantsOnPage}
        onConfirm={onConfirm}
        confirming={confirming}
        confirmLabel={confirmLabel}
      />
    </div>
  );
}