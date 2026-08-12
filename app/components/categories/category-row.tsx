// src/routes/backoffice/categories/components/CategoryRow.tsx
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import HighlightedText from "../highlighted-text";
import { CategoryActions } from "./category-actions";
import type { Category } from "wle-core";

type CategoryRowProps = {
    category: Category,
    level: number,
    hasChildren: boolean,
    isExpanded: boolean,
    onToggle: () => void,
    searchQuery?: string,
    onEdit: (category: Category) => void;
    onAddSub: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export function CategoryRow({ category, level, hasChildren, isExpanded, onToggle, searchQuery = "", onEdit, onAddSub, onDelete }: CategoryRowProps) {
    const opacity = Math.max(0.05, 0.2 - level * 0.05);
    const blur = Math.max(4, 12 - level * 2);

    return (
        <div className="relative group">
            {level > 0 && (
                <div
                    className="absolute border-l border-border"
                    style={{
                        left: `${(level * 32) - 20}px`,
                        top: '-12px',
                        bottom: '22px',
                        borderBottomLeftRadius: '8px',
                        borderBottomWidth: '1px',
                        width: '12px'
                    }}
                />
            )}

            <div
                className={`
                    group flex items-center justify-between p-3 rounded-xl border transition-all mb-2
                    ${isExpanded ? 'ring-1 ring-primary/30 border-primary/50' : 'border-border/50'}
                `}
                style={{
                    marginLeft: `${level * 32}px`,
                    backgroundColor: `color-mix(in srgb, var(--muted), transparent ${100 - (opacity * 100)}%)`,
                    backdropFilter: `blur(${blur}px)`,
                }}
            >
                <div className="flex items-center gap-3">
                    {hasChildren ? (
                        <button
                            onClick={onToggle}
                            className={`p-1 rounded transition-colors ${isExpanded ? 'bg-primary/20 text-primary' : 'hover:bg-accent text-muted-foreground'}`}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <div className="w-6 flex justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        </div>
                    )}

                    <div className="flex flex-col">
                        <span className={`text-sm font-semibold tracking-tight ${level === 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                            <HighlightedText text={category.title} query={searchQuery} />
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                            ID: {category.id} • 0 Products
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <CategoryActions
                        category={category}
                        onEdit={onEdit}
                        onAddSub={onAddSub}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        </div>
    );
}