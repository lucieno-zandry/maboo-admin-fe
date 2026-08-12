import { AlertTriangle, Calendar, Pencil, Shield, Tag, ToggleLeft, ToggleRight, Trash2, TrendingUp, Users } from "lucide-react";
import { useCallback, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { CodeBadge } from "./code-badge";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { formatDate } from "~/lib/format-date";
import { cn } from "~/lib/utils";
import { StatCard } from "./start-card";
import { UserRow } from "./user-row";
import ClientCodeDetailSekeleton from "./client-code-detail-sekeleton";
import type { ClientCode } from "wle-core";

export type DetailPanelProps = {
    code: ClientCode | null;
    loading: boolean;
    selectedCodeId: number | null;
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: () => void;
    onDetachUser: (userId: number) => void;
    mutating: boolean;
};

export function DetailPanel({
    code,
    loading,
    selectedCodeId,
    onEdit,
    onDelete,
    onToggleActive,
    onDetachUser,
    mutating,
}: DetailPanelProps) {
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    }, []);

    if (!selectedCodeId) {
        return null
    }

    if (loading || !code) {
        return <ClientCodeDetailSekeleton />
    }

    const usesCount = code.users?.length ?? 0;
    const isFull = code.max_uses != null && usesCount >= code.max_uses;
    const usagePercent = code.max_uses
        ? Math.min((usesCount / code.max_uses) * 100, 100)
        : null;

    return (
        <ScrollArea className="h-full bg-background/80 backdrop-blur-md rounded-2xl">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <CodeBadge
                            code={code.code}
                            onCopy={() => handleCopy(code.code)}
                            copied={copiedCode}
                        />
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "h-2 w-2 rounded-full",
                                    !code.is_active
                                        ? "bg-muted-foreground"
                                        : isFull
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                )}
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                                {!code.is_active ? "Inactive" : isFull ? "Full" : "Active"}
                            </span>
                            <Badge variant="outline" className="text-[10px] py-0 h-4">
                                ID #{code.id}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1.5"
                                        onClick={onToggleActive}
                                        disabled={mutating}
                                    >
                                        {code.is_active ? (
                                            <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        {code.is_active ? "Deactivate" : "Activate"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Toggle active state</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:border-destructive hover:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<Users className="h-4 w-4" />}
                        label="Total Users"
                        value={String(usesCount)}
                        sub={code.max_uses ? `${code.max_uses} max` : "Unlimited"}
                        accent={isFull ? "amber" : "default"}
                    />
                    <StatCard
                        icon={<Shield className="h-4 w-4" />}
                        label="Max Uses"
                        value={code.max_uses != null ? String(code.max_uses) : "∞"}
                        sub="configured limit"
                        accent="default"
                    />
                    <StatCard
                        icon={<Calendar className="h-4 w-4" />}
                        label="Created"
                        value={formatDate(code.created_at)}
                        sub={formatDate(code.created_at)}
                        accent="default"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-4 w-4" />}
                        label="Usage"
                        value={usagePercent != null ? `${Math.round(usagePercent)}%` : "Open"}
                        sub={
                            usagePercent != null
                                ? `${usesCount} of ${code.max_uses} slots used`
                                : "No limit set"
                        }
                        accent={
                            usagePercent != null && usagePercent >= 90
                                ? "red"
                                : usagePercent != null && usagePercent >= 60
                                    ? "amber"
                                    : "default"
                        }
                    />
                </div>

                {/* Usage bar */}
                {usagePercent !== null && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Usage capacity</span>
                            <span>{Math.round(usagePercent)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    usagePercent >= 90
                                        ? "bg-destructive"
                                        : usagePercent >= 60
                                            ? "bg-amber-500"
                                            : "bg-emerald-500"
                                )}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                        {isFull && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                This code has reached its maximum usage limit.
                            </div>
                        )}
                    </div>
                )}

                <Separator />

                {/* Users list */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Assigned Users
                            <Badge variant="secondary" className="text-xs">
                                {usesCount}
                            </Badge>
                        </h3>
                    </div>

                    {!code.users || code.users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 border rounded-xl border-dashed text-muted-foreground">
                            <Users className="h-6 w-6 mb-2 opacity-30" />
                            <p className="text-xs">No users assigned yet</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {code.users.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onDetach={() => onDetachUser(user.id)}
                                    disabled={mutating}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}
