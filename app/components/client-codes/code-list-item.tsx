import { CheckCheck, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import type { ClientCode } from "wle-core";

export type CodeListItemProps = {
    code: ClientCode;
    isActive: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onToggleCheckbox: (e: React.MouseEvent) => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
};

export function CodeListItem({
    code,
    isActive,
    isSelected,
    onSelect,
    onToggleCheckbox,
    onEdit,
    onDelete,
}: CodeListItemProps) {
    const usesCount = code.users?.length ?? 0;
    const usagePercent =
        code.max_uses ? Math.min((usesCount / code.max_uses) * 100, 100) : null;
    const isFull = code.max_uses != null && usesCount >= code.max_uses;

    return (
        <div
            onClick={onSelect}
            className={cn(
                "group relative flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg border transition-all duration-150",
                isActive
                    ? "bg-primary/5 border-primary/30 shadow-sm"
                    : "border-transparent hover:bg-muted/50 hover:border-border"
            )}
        >
            {/* Checkbox */}
            <div
                onClick={onToggleCheckbox}
                className={cn(
                    "shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                    isSelected
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30 opacity-0 group-hover:opacity-100"
                )}
            >
                {isSelected && <CheckCheck className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>

            {/* Status dot */}
            <div
                className={cn(
                    "shrink-0 h-2 w-2 rounded-full",
                    !code.is_active ? "bg-muted-foreground" : isFull ? "bg-amber-500" : "bg-emerald-500"
                )}
            />

            {/* Code & meta */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm tracking-wider truncate">
                        {code.code}
                    </span>
                    {!code.is_active && (
                        <Badge variant="secondary" className="text-[10px] py-0 h-4">
                            Inactive
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {usesCount}
                        {code.max_uses != null ? `/${code.max_uses}` : ""}
                    </span>
                    {usagePercent !== null && (
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[60px]">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    usagePercent >= 90
                                        ? "bg-destructive"
                                        : usagePercent >= 60
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                )}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
