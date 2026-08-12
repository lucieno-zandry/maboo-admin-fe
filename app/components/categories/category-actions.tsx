// ~/routes/backoffice/categories/components/category-actions.tsx
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "wle-core";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface CategoryActionsProps {
    category: Category;
    onEdit: (category: Category) => void;
    onAddSub: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export function CategoryActions({ category, onEdit, onAddSub, onDelete }: CategoryActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all md:opacity-0 group-hover:opacity-100 outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Open actions"
                >
                    <MoreVertical size={16} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-52 bg-popover/90 backdrop-blur-xl border-border shadow-xl animate-in fade-in zoom-in-95 duration-200"
            >
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2">
                    Category Actions
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem
                    onClick={() => onEdit(category)}
                    className="gap-3 px-3 py-2.5 cursor-pointer focus:bg-accent transition-colors"
                >
                    <Pencil size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Edit Details</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => onAddSub(category)}
                    className="gap-3 px-3 py-2.5 cursor-pointer focus:bg-accent transition-colors"
                >
                    <Plus size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Add Sub-category</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem
                    onClick={() => onDelete(category)}
                    className="gap-3 px-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                >
                    <Trash2 size={14} />
                    <span className="text-sm font-medium">Delete Category</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}