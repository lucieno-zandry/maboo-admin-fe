import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDate } from "~/lib/format-date";
import { useTransactionDetailStore } from "~/hooks/use-transaction-detail-store";
import type { PaymentWebhookLog } from "wle-core";

const WEBHOOK_STATUS_COLORS: Record<string, string> = {
    RECEIVED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PROCESSED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    FAILED: "bg-red-500/15 text-red-400 border-red-500/30",
    IGNORED: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
};

export type WebhookLogListViewProps = {
    logs: PaymentWebhookLog[];
    isLoading: boolean;
    page: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
};

export function WebhookLogListView({
    logs, isLoading, page, total, onPrev, onNext,
}: WebhookLogListViewProps) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-zinc-300">
                        Webhook Logs
                        {total > 0 && (
                            <span className="ml-2 text-xs text-zinc-500 font-normal">
                                ({total})
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onPrev} disabled={page <= 1}
                            className="h-6 w-6 text-zinc-600 hover:text-white">
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNext} disabled={logs.length < 20}
                            className="h-6 w-6 text-zinc-600 hover:text-white">
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 bg-zinc-800 rounded-md" />
                    ))
                ) : logs.length === 0 ? (
                    <p className="text-xs text-zinc-600 py-4 text-center">
                        No webhook logs.
                    </p>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-center gap-3 p-3 rounded-md bg-zinc-800/50 text-xs"
                        >
                            <Badge
                                variant="outline"
                                className={`text-[10px] font-mono uppercase shrink-0 border ${WEBHOOK_STATUS_COLORS[log.status]
                                    }`}
                            >
                                {log.status}
                            </Badge>
                            <span className="text-zinc-400 font-mono">{log.gateway}</span>
                            {log.event_type && (
                                <span className="text-zinc-500">{log.event_type}</span>
                            )}
                            <span className="text-zinc-600 ml-auto shrink-0">
                                {formatDate(log.created_at)}
                            </span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export function WebhookLogList() {
    const {
        webhookLogs, webhookLogsLoading, webhookLogsPage, webhookLogsTotal,
        setWebhookLogsPage,
    } = useTransactionDetailStore();

    return (
        <WebhookLogListView
            logs={webhookLogs}
            isLoading={webhookLogsLoading}
            page={webhookLogsPage}
            total={webhookLogsTotal}
            onPrev={() => setWebhookLogsPage(webhookLogsPage - 1)}
            onNext={() => setWebhookLogsPage(webhookLogsPage + 1)}
        />
    );
}