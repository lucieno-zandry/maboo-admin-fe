import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Activity, ArrowRight } from "lucide-react";
import type { TransactionAuditLog } from "wle-core";

function AuditLogsView({ logs }: { logs: TransactionAuditLog[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    Audit Logs
                </CardTitle>
            </CardHeader>
            <div className="p-4 sm:p-6">
                <div className="relative border-l border-muted-foreground/20 ml-3 space-y-6 pb-4">
                    {logs.map((log) => (
                        <div key={log.id} className="relative pl-6">
                            {/* Timeline dot */}
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="font-medium text-sm">{log.action}</p>
                                    <time className="text-xs text-muted-foreground shrink-0">
                                        {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                </div>

                                {log.reason && (
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">Reason:</span> {log.reason}
                                    </p>
                                )}

                                {(log.old_value || log.new_value) && (
                                    <div className="flex items-center gap-3 mt-2 bg-muted p-2.5 rounded-md overflow-x-auto">
                                        {log.old_value && (
                                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border text-muted-foreground">
                                                {log.old_value}
                                            </code>
                                        )}
                                        {log.old_value && log.new_value && (
                                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                        )}
                                        {log.new_value && (
                                            <code className="text-xs bg-background px-1.5 py-0.5 rounded border text-emerald-600 dark:text-emerald-500">
                                                {log.new_value}
                                            </code>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

export function AuditLogsTab() {
    const { user } = useUserDetailStore();
    if (!user?.performed_transaction_audit_logs?.length) return null;
    return <AuditLogsView logs={user.performed_transaction_audit_logs} />;
}