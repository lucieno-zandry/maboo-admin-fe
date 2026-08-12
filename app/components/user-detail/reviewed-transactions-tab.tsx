import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ClipboardCheck, Eye } from "lucide-react";
import type { Transaction } from "wle-core";

function ReviewedTransactionsView({ transactions }: { transactions: Transaction[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                    Reviewed Transactions
                </CardTitle>
            </CardHeader>
            <div className="flex flex-col">
                {transactions.map((tx, index) => (
                    <div
                        key={tx.uuid}
                        className={`flex items-center justify-between p-4 sm:p-6 transition-colors hover:bg-muted/30 ${index !== transactions.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="space-y-1">
                            <span className="font-mono text-sm font-medium text-muted-foreground">ID: {tx.uuid.split('-')[0]}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Status:</span>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                    {tx.status}
                                </Badge>
                            </div>
                        </div>
                        <Button size="sm" variant="secondary" className="gap-2">
                            <Eye className="h-4 w-4" /> View Notes
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function ReviewedTransactionsTab() {
    const { user } = useUserDetailStore();
    if (!user?.reviewed_transactions?.length) return null;
    return <ReviewedTransactionsView transactions={user.reviewed_transactions} />;
}