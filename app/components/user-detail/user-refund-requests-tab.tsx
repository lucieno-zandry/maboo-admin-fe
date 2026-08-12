import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Undo2, MoreVertical, CheckCircle, XCircle, FileText } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { RefundRequest } from "wle-core";

function RefundRequestsView({ requests }: { requests: RefundRequest[] }) {
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Undo2 className="h-5 w-5 text-muted-foreground" />
                    Refund Requests
                </CardTitle>
            </CardHeader>
            <div className="flex flex-col">
                {requests.map((req, index) => (
                    <div
                        key={req.uuid}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 transition-colors hover:bg-muted/30 ${index !== requests.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">#{req.uuid.split('-')[0]}</span>
                                <Badge variant={getStatusVariant(req.status)} className="capitalize text-[10px] px-1.5 py-0 h-5">
                                    {req.status}
                                </Badge>
                            </div>
                            <div className="text-sm border-l-2 border-muted pl-3 py-0.5 mt-1">
                                <span className="text-muted-foreground text-xs uppercase font-medium tracking-wider">Reason</span>
                                <p className="text-foreground mt-0.5 line-clamp-2">{req.reason}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <p className="font-semibold text-base">${Number(req.amount).toFixed(2)}</p>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        Actions <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" /> View Request
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve Refund
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                        <XCircle className="mr-2 h-4 w-4" /> Reject Refund
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function RefundRequestsTab() {
    const { user } = useUserDetailStore();
    if (!user?.refund_requests?.length) return null;
    return <RefundRequestsView requests={user.refund_requests} />;
}