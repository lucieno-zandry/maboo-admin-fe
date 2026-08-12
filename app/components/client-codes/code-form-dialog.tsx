import { useEffect, useState } from "react";
import { generateCode } from "~/lib/client-codes";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Hash, Loader2, Shuffle } from "lucide-react";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import type { ClientCode } from "wle-core";

export type CodeFormDialogProps = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialCode?: ClientCode | null;
    onSubmit: (data: {
        code: string;
        is_active: boolean;
        max_uses: number | null;
    }) => void;
    loading: boolean;
};

export function CodeFormDialog({
    open,
    onOpenChange,
    initialCode,
    onSubmit,
    loading,
}: CodeFormDialogProps) {
    const isEdit = !!initialCode;
    const [codeValue, setCodeValue] = useState(initialCode?.code ?? "");
    const [isActive, setIsActive] = useState(initialCode?.is_active ?? true);
    const [maxUses, setMaxUses] = useState<string>(
        initialCode?.max_uses != null ? String(initialCode.max_uses) : ""
    );
    const [error, setError] = useState("");

    // Reset when dialog opens/closes
    useEffect(() => {
        if (open) {
            setCodeValue(initialCode?.code ?? "");
            setIsActive(initialCode?.is_active ?? true);
            setMaxUses(initialCode?.max_uses != null ? String(initialCode.max_uses) : "");
            setError("");
        }
    }, [open, initialCode]);

    const handleGenerate = () => {
        setCodeValue(generateCode());
        setError("");
    };

    const handleSubmit = () => {
        const clean = codeValue.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
        if (!clean) {
            setError("Code is required");
            return;
        }
        if (clean.length < 4) {
            setError("Code must be at least 4 characters");
            return;
        }
        const parsedMax = maxUses ? parseInt(maxUses, 10) : null;
        if (maxUses && (isNaN(parsedMax!) || parsedMax! < 1)) {
            setError("Max uses must be a positive number");
            return;
        }
        onSubmit({ code: clean, is_active: isActive, max_uses: parsedMax });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Client Code" : "Create Client Code"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the details for this client code."
                            : "Create a new client code to give customers access to special pricing."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Code input */}
                    <div className="space-y-1.5">
                        <Label>Code</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    value={codeValue}
                                    onChange={(e) => {
                                        setCodeValue(e.target.value.toUpperCase().slice(0, 12));
                                        setError("");
                                    }}
                                    placeholder="e.g. VIP2024"
                                    className="pl-8 font-mono tracking-wider"
                                    maxLength={12}
                                />
                            </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" type="button" onClick={handleGenerate}>
                                            <Shuffle className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Generate random code</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                        <p className="text-xs text-muted-foreground">
                            Letters and numbers only. Will be uppercased automatically.
                        </p>
                    </div>

                    {/* Max uses */}
                    <div className="space-y-1.5">
                        <Label>Max Uses</Label>
                        <Input
                            type="number"
                            min={1}
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            placeholder="Leave blank for unlimited"
                            className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum number of users that can use this code. Leave blank for unlimited.
                        </p>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <div className="space-y-0.5">
                            <Label className="text-sm">Active</Label>
                            <p className="text-xs text-muted-foreground">
                                Only active codes can be used by customers.
                            </p>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {isEdit ? "Save Changes" : "Create Code"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}