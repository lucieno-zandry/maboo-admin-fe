import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Search,
  PackageOpen,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SORT_OPTIONS, useProductList } from "./product-list.controller";
import { ProductListItem } from "./product-list-item.view";
import getCurrency from "~/lib/get-currency";
import type { Product } from "wle-core";

type ProductListProps = {
  selectedId: number | null;
  onSelect: (product: Product) => void;
};

export function ProductList({ selectedId, onSelect }: ProductListProps) {
  const {
    products,
    isLoading,
    total,
    page,
    setPage,
    totalPages,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    categories,
    commandOpen,
    setCommandOpen,
    closeCommand,
    commandSearch,
    setCommandSearch,
    commandResults,
    isSearching,
  } = useProductList();

  function handleCommandSelect(product: Product) {
    onSelect(product);
    closeCommand();
  }

  return (
    <div className="flex flex-col h-full border-r border-border overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Products</h2>
          <span className="text-xs text-muted-foreground">{total} items</span>
        </div>

        {/* Search trigger */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 justify-start gap-2 text-sm text-muted-foreground font-normal"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="w-3.5 h-3.5" />
          Search products…
        </Button>

        {/* Category + Sort row */}
        <div className="flex gap-2">
          <Select
            value={filters.categoryId?.toString() ?? "all"}
            onValueChange={(v) =>
              setFilters({ categoryId: v === "all" ? null : parseInt(v) })
            }
          >
            <SelectTrigger className="h-8 text-sm flex-1">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortKey}
            onValueChange={(v) => setFilters({ sortKey: v })}
          >
            <SelectTrigger className="h-8 text-sm flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem
                  key={`${opt.order_by}:${opt.direction}`}
                  value={`${opt.order_by}:${opt.direction}`}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`Min ${getCurrency.symbol()}`}
            value={filters.minPrice}
            onChange={(e) => setFilters({ minPrice: e.target.value })}
            className="h-8 text-sm"
          />
          {/* <Separator orientation="horizontal" className="w-3 shrink-0" /> */}
          <Input
            type="number"
            placeholder={`Max ${getCurrency.symbol()}`}
            value={filters.maxPrice}
            onChange={(e) => setFilters({ maxPrice: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* Active filter badge + reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full text-xs text-muted-foreground gap-1"
            onClick={resetFilters}
          >
            <X className="w-3 h-3" />
            Clear filters
          </Button>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <PackageOpen className="w-10 h-10" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              isSelected={selectedId === product.id}
              onClick={onSelect}
            />
          ))
        )}
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Search command overlay */}
      <Dialog open={commandOpen} onOpenChange={(open) => !open && closeCommand()}>
        <DialogContent className="p-0 gap-0 max-w-md overflow-hidden">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search products…"
              value={commandSearch}
              onValueChange={setCommandSearch}
            />
            <CommandList>
              {isSearching ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : !commandSearch.trim() ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search…
                </div>
              ) : commandResults.length === 0 ? (
                <CommandEmpty>No products found.</CommandEmpty>
              ) : (
                commandResults.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={String(product.id)}
                    onSelect={() => handleCommandSelect(product)}
                    className="p-0"
                  >
                    <ProductListItem
                      product={product}
                      isSelected={selectedId === product.id}
                      onClick={handleCommandSelect}
                    />
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}