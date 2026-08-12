import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CreditCard, Receipt, ArrowUpRight } from "lucide-react";
import type { Transaction } from "wle-core";

function TransactionsView({ transactions }: { transactions: Transaction[] }) {
    const getStatusVariant = (status: string) => {
        switch (status.toUpperCase()) {
            case 'SUCCESS': return 'default';
            case 'PENDING': return 'secondary';
            case 'FAILED': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    Transaction History
                </CardTitle>
            </CardHeader>
            <div className="flex flex-col">
                {transactions.map((tx, index) => (
                    <div
                        key={tx.uuid}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 transition-colors hover:bg-muted/30 ${index !== transactions.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">{tx.uuid.split('-')[0]}...</span>
                                <Badge variant={getStatusVariant(tx.status)} className="text-[10px] px-1.5 py-0 h-5">
                                    {tx.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}
                            </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                            <p className="font-semibold text-base">${Number(tx.amount).toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Receipt className="h-4 w-4" /> Receipt
                                </Button>
                                <Button size="sm" variant="secondary" className="gap-2">
                                    Details <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function TransactionsTab() {
    const { user } = useUserDetailStore();
    if (!user?.transactions?.length) return null;
    return <TransactionsView transactions={user.transactions} />;
}