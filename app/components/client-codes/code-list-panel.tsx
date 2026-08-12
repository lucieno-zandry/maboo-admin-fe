import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, Tag, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { CodeListItem } from "./code-list-item";
import { cn } from "~/lib/utils";
import type { ClientCode } from "wle-core";

export type CodeListPanelProps = {
    codes: ClientCode[];
    meta: { current_page: number; last_page: number; total: number; from: number; to: number } | null;
    loading: boolean;
    search: string;
    onSearchChange: (v: string) => void;
    filterActive: "all" | "active" | "inactive";
    onFilterChange: (v: "all" | "active" | "inactive") => void;
    selectedCodeId: number | null;
    onSelectCode: (id: number) => void;
    selectedIds: Set<number>;
    onToggleCheckbox: (id: number, e: React.MouseEvent) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkDelete: () => void;
    onEdit: (code: ClientCode, e: React.MouseEvent) => void;
    onDelete: (code: ClientCode, e: React.MouseEvent) => void;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
    onCreateOpen: () => void;
};

export function CodeListPanel({
    codes,
    meta,
    loading,
    search,
    onSearchChange,
    filterActive,
    onFilterChange,
    selectedCodeId,
    onSelectCode,
    selectedIds,
    onToggleCheckbox,
    onSelectAll,
    onClearSelection,
    onBulkDelete,
    onEdit,
    onDelete,
    onPageChange,
    onRefresh,
    onCreateOpen,
}: CodeListPanelProps) {
    const hasSelection = selectedIds.size > 0;

    return (
        <div className="flex flex-col h-full border-r bg-background/80 backdrop-blur-md rounded-2xl overflow-y-auto">
            {/* Header */}
            <div className="px-4 pt-5 pb-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold">Client Codes</h2>
                        {meta && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {meta.total} code{meta.total !== 1 ? "s" : ""} total
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
                                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Refresh</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button size="sm" onClick={onCreateOpen} className="h-8 gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            New
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search codes..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-8 h-8 text-sm"
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

                {/* Filter */}
                <div className="flex gap-1">
                    {(["all", "active", "inactive"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => onFilterChange(f)}
                            className={cn(
                                "text-xs px-2.5 py-1 rounded-full capitalize transition-colors",
                                filterActive === f
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk bar */}
            {hasSelection && (
                <div className="mx-4 mb-2 flex items-center justify-between gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium">
                        {selectedIds.size} selected
                    </span>
                    <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onClearSelection}>
                            Clear
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 text-xs gap-1"
                            onClick={onBulkDelete}
                        >
                            <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                    </div>
                </div>
            )}

            <Separator />

            {/* List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {loading && codes.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-3">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))
                    ) : codes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Tag className="h-8 w-8 mb-3 opacity-30" />
                            <p className="text-sm">No client codes found</p>
                        </div>
                    ) : (
                        codes.map((code) => (
                            <CodeListItem
                                key={code.id}
                                code={code}
                                isActive={selectedCodeId === code.id}
                                isSelected={selectedIds.has(code.id)}
                                onSelect={() => onSelectCode(code.id)}
                                onToggleCheckbox={(e) => onToggleCheckbox(code.id, e)}
                                onEdit={(e) => onEdit(code, e)}
                                onDelete={(e) => onDelete(code, e)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <>
                    <Separator />
                    <div className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-xs text-muted-foreground">
                            {meta.from}–{meta.to} of {meta.total}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={meta.current_page <= 1}
                                onClick={() => onPageChange(meta.current_page - 1)}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-xs font-medium px-1">
                                {meta.current_page}/{meta.last_page}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => onPageChange(meta.current_page + 1)}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
