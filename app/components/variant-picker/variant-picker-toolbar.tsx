// ~/components/variant-picker/variant-picker-toolbar.tsx
import { Search, X, ArrowUpDown, ChevronsUpDown } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import type { ProductQueryParams } from "~/lib/serialize-product-params";
import type { Category } from "wle-core";

export type VariantPickerToolbarProps = {
    search: string;
    onSearchChange: (v: string) => void;

    categoryId: string; // "all" or stringified category id
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

    loading: boolean;
};

export function VariantPickerToolbar({
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
    loading,
}: VariantPickerToolbarProps) {
    return (
        <div className="space-y-2 px-4 pt-4 pb-3 border-b shrink-0">
            {/* Row 1: search */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                    placeholder="Search products by name or SKU..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 h-8 text-sm"
                    disabled={loading}
                />
                {search && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>

            {/* Row 2: filters + sort + per-page */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Category filter */}
                <Select value={categoryId} onValueChange={onCategoryChange}>
                    <SelectTrigger className="h-7 text-xs w-36">
                        <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort by */}
                <Select
                    value={sortBy}
                    onValueChange={(v) => onSortByChange(v as ProductQueryParams["order_by"])}
                >
                    <SelectTrigger className="h-7 text-xs w-32">
                        <ArrowUpDown className="h-3 w-3 mr-1.5 shrink-0" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at">Newest</SelectItem>
                        <SelectItem value="title">Name</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort order */}
                <Select
                    value={sortOrder}
                    onValueChange={(v) => onSortOrderChange(v as ProductQueryParams["direction"])}
                >
                    <SelectTrigger className="h-7 text-xs w-24">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DESC">Desc</SelectItem>
                        <SelectItem value="ASC">Asc</SelectItem>
                    </SelectContent>
                </Select>

                {/* Per page */}
                <Select
                    value={String(perPage)}
                    onValueChange={(v) => onPerPageChange(Number(v))}
                >
                    <SelectTrigger className="h-7 text-xs w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 / page</SelectItem>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                    </SelectContent>
                </Select>

                {/* Expand / collapse all */}
                <div className="flex gap-1 ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 px-2"
                        onClick={onExpandAll}
                    >
                        <ChevronsUpDown className="h-3 w-3" />
                        Expand all
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 px-2"
                        onClick={onCollapseAll}
                    >
                        Collapse
                    </Button>
                </div>
            </div>
        </div>
    );
}