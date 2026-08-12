import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { formatDate } from "~/lib/format-date";
import { useTransactionDetailStore } from "~/hooks/use-transaction-detail-store";
import type { TransactionAuditLog } from "wle-core";

const ACTION_COLORS: Record<string, string> = {
    status_override: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    status_updated: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    refund_initiated: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    notification_resent: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    reviewed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dispute_opened: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    dispute_resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    soft_deleted: "bg-red-500/15 text-red-400 border-red-500/30",
    restored: "bg-green-500/15 text-green-400 border-green-500/30",
};

export type AuditLogListViewProps = {
    logs: TransactionAuditLog[];
    isLoading: boolean;
    page: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
};

export function AuditLogListView({
    logs,
    isLoading,
    page,
    total,
    onPrev,
    onNext,
}: AuditLogListViewProps) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-zinc-300">
                        Audit Trail
                        {total > 0 && (
                            <span className="ml-2 text-xs text-zinc-500 font-normal">
                                ({total} entries)
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPrev}
                            disabled={page <= 1}
                            className="h-6 w-6 text-zinc-600 hover:text-white"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNext}
                            disabled={logs.length < 20}
                            className="h-6 w-6 text-zinc-600 hover:text-white"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 bg-zinc-800 rounded-md" />
                    ))
                ) : logs.length === 0 ? (
                    <p className="text-xs text-zinc-600 py-4 text-center">
                        No audit entries yet.
                    </p>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                        >
                            <Badge
                                variant="outline"
                                className={`text-[10px] font-mono uppercase shrink-0 border ${ACTION_COLORS[log.action] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                                    }`}
                            >
                                {log.action.replace(/_/g, " ")}
                            </Badge>
                            <div className="flex-1 min-w-0">
                                {(log.old_value || log.new_value) && (
                                    <p className="text-xs text-zinc-400">
                                        <span className="text-zinc-600">{log.old_value}</span>
                                        {log.old_value && log.new_value && (
                                            <span className="text-zinc-600 mx-1">→</span>
                                        )}
                                        <span className="text-zinc-200">{log.new_value}</span>
                                    </p>
                                )}
                                {log.reason && (
                                    <p className="text-xs text-zinc-500 mt-0.5 truncate" title={log.reason}>
                                        {log.reason}
                                    </p>
                                )}
                                <p className="text-[10px] text-zinc-600 mt-1">
                                    {log.performed_by_user?.name ?? "System"} · {formatDate(log.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export default function AuditLogList() {
    const {
        auditLogs, auditLogsLoading, auditLogsPage, auditLogsTotal,
        setAuditLogsPage,
    } = useTransactionDetailStore();

    return (
        <AuditLogListView
            logs={auditLogs}
            isLoading={auditLogsLoading}
            page={auditLogsPage}
            total={auditLogsTotal}
            onPrev={() => setAuditLogsPage(auditLogsPage - 1)}
            onNext={() => setAuditLogsPage(auditLogsPage + 1)}
        />
    );
}
