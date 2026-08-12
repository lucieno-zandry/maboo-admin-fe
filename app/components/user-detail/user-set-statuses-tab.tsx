import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { UserCheck, Calendar, Clock, FileText, Fingerprint, ExternalLink } from "lucide-react";
import { Link } from "react-router"; // Or your preferred router
import type { UserStatus } from "wle-core";

// Dumb view
function SetStatusesView({ statuses }: { statuses: UserStatus[] }) {
    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
            case "blocked":
                return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
            case "suspended":
                return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(dateString));
    };

    return (
        <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b p-4 sm:px-6 sm:py-5 bg-muted/40">
                <CardTitle className="text-lg font-semibold flex items-center gap-2.5">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Statuses Set by This User
                </CardTitle>
            </CardHeader>
            <div className="flex flex-col">
                {statuses.map((status, index) => (
                    <div
                        key={status.id}
                        className={`group flex flex-col gap-3 p-4 sm:p-6 transition-all hover:bg-muted/20 ${index !== statuses.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-3 w-full">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={`px-2.5 py-0.5 uppercase tracking-wider text-[11px] font-bold ${getStatusStyles(status.status)}`}>
                                            {status.status}
                                        </Badge>
                                        <Link
                                            to={`../${status.user_id}`}
                                            className="text-sm font-medium text-foreground hover:text-primary hover:underline flex items-center gap-1"
                                        >
                                            Applied to: {status.user?.name || `User ${status.user_id}`}
                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                        </Link>
                                    </div>
                                </div>

                                {status.reason && (
                                    <div className="flex items-start gap-2.5 rounded-md bg-muted/50 p-3.5 text-sm text-muted-foreground border border-border/50">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                                        <p className="leading-relaxed">{status.reason}</p>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 opacity-70" />
                                        <span>{formatDate(status.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Fingerprint className="h-3.5 w-3.5 opacity-70" />
                                        <span>Record ID: {status.id}</span>
                                    </div>
                                    {status.expires_at && (
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>Expires: {formatDate(status.expires_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function UserSetStatusesTab() {
    const { user } = useUserDetailStore();
    if (!user?.set_statuses?.length) return null;
    return <SetStatusesView statuses={user.set_statuses} />;
}