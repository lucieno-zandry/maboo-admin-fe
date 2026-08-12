import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import { Plus, Trash2, X, Info, Layers } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ProductEditorController } from "./product-editor.controller";
import type { ProductDraft } from "~/types/drafts";

type Step2GroupsProps = {
    draft: ProductDraft;
    ctrl: Pick<
        ProductEditorController,
        | "addGroup"
        | "updateGroupName"
        | "removeGroup"
        | "addOption"
        | "updateOption"
        | "removeOption"
    >;
};

export function Step2Groups({ draft, ctrl }: Step2GroupsProps) {
    return (
        <div className="space-y-5">
            {/* Explanation */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <p>
                    Variant groups define the <strong className="text-foreground">dimensions</strong> of your product (e.g. <em>Size</em>, <em>Color</em>).
                    Each group has options (e.g. S, M, L). Variants are generated from every combination in the next step.
                </p>
            </div>

            {/* Empty state */}
            {draft.variantGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground gap-3">
                    <Layers className="w-8 h-8" />
                    <p className="text-sm">No variant groups yet.</p>
                    <p className="text-xs">
                        Skip this step if your product has no variants (e.g. a single item).
                    </p>
                </div>
            )}

            {/* Groups */}
            <div className="space-y-4">
                {draft.variantGroups.map((group) => (
                    <div
                        key={group.tempId}
                        className="rounded-xl border border-border bg-card p-4 space-y-3"
                    >
                        {/* Group name row */}
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Group name (e.g. Size, Color)"
                                value={group.name}
                                onChange={(e) => ctrl.updateGroupName(group.tempId, e.target.value)}
                                className="flex-1 font-medium"
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => ctrl.removeGroup(group.tempId)}
                                            className="text-muted-foreground hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Remove group</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Options */}
                        <div className="flex flex-wrap gap-2 min-h-[36px]">
                            {group.options.map((opt) => (
                                <div
                                    key={opt.tempId}
                                    className={cn(
                                        "flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1",
                                        "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent"
                                    )}
                                >
                                    <input
                                        className="bg-transparent text-sm outline-none w-16 min-w-0"
                                        placeholder="Value"
                                        value={opt.value}
                                        onChange={(e) =>
                                            ctrl.updateOption(group.tempId, opt.tempId, e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => ctrl.removeOption(group.tempId, opt.tempId)}
                                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Add option */}
                            <button
                                type="button"
                                onClick={() => ctrl.addOption(group.tempId)}
                                className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                Add option
                            </button>
                        </div>

                        {/* Option count hint */}
                        {group.options.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {group.options.length} option{group.options.length !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Add group button */}
            <Button
                variant="outline"
                onClick={ctrl.addGroup}
                className="gap-2 w-full border-dashed"
            >
                <Plus className="w-4 h-4" />
                Add variant group
            </Button>

            {/* Preview of combinations */}
            {draft.variantGroups.length > 0 && (
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                        COMBINATION PREVIEW
                    </p>
                    <p className="text-sm">
                        {draft.variantGroups
                            .map((g) =>
                                g.options.length
                                    ? `${g.name || "?"} (${g.options.length})`
                                    : null
                            )
                            .filter(Boolean)
                            .join(" × ")}
                        {" = "}
                        <strong>
                            {draft.variantGroups
                                .filter((g) => g.options.length > 0)
                                .reduce((acc, g) => acc * g.options.length, 1)}
                        </strong>{" "}
                        variant{draft.variantGroups.filter((g) => g.options.length > 0).reduce((acc, g) => acc * g.options.length, 1) !== 1 ? "s" : ""}
                    </p>
                </div>
            )}
        </div>
    );
}