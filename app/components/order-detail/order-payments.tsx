import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { useOrderDetailStore } from "~/hooks/use-order-detail-store";
import formatPrice from "~/lib/format-price";
import { StatusBadge } from "../custom-ui/status-badge";
import { useNavigate } from "react-router";
import useRouterStore from "~/hooks/use-router-store";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "~/components/ui/dropdown-menu"; // adjust path to your shadcn dropdown export
import { Ellipsis } from "lucide-react";
import type { Transaction } from "wle-core";

// ===== VIEW =====
export type OrderPaymentsViewProps = {
    transactions: Transaction[];
    onViewPayment: (payment: Transaction) => void;
};

export function OrderPaymentsView({ transactions, onViewPayment }: OrderPaymentsViewProps) {
    if (transactions.length === 0) {
        return <div className="border rounded-lg p-8 text-center text-muted-foreground">No payment transactions.</div>;
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Dispute</TableHead>           {/* new column */}
                        <TableHead>Reference</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => {
                        const handleRowClick = () => onViewPayment(tx);
                        const handleRowKeyDown = (e: React.KeyboardEvent) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onViewPayment(tx);
                            }
                        };

                        return (
                            <TableRow
                                key={tx.uuid}
                                className="hover:bg-muted cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onClick={handleRowClick}
                                onKeyDown={handleRowKeyDown}
                            >
                                <TableCell>{format(new Date(tx.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                                <TableCell>{tx.payment_method}</TableCell>
                                <TableCell>{formatPrice(tx.amount)}</TableCell>
                                <TableCell>
                                    <StatusBadge status={tx.status}>{tx.status}</StatusBadge>
                                </TableCell>
                                <TableCell>
                                    {tx.dispute_status ? (
                                        <StatusBadge status={tx.dispute_status.toLowerCase()}>
                                            {tx.dispute_status}
                                        </StatusBadge>
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">{tx.informations?.transaction_id || "—"}</TableCell>
                                <TableCell
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="inline-flex items-center justify-center rounded-md p-1 text-sm hover:bg-muted"
                                                aria-label={`Open actions for payment ${tx.informations?.transaction_id || tx.uuid}`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Ellipsis />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" sideOffset={6}>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewPayment(tx);
                                                }}
                                            >
                                                View
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}


// ===== CONTAINER =====
export default function OrderPayments() {
    const { order } = useOrderDetailStore();
    const navigate = useNavigate();
    const { lang } = useRouterStore();

    if (!order) return null;

    const handleViewPayment = (payment: Transaction) => {
        return navigate(`/${lang}/transactions/${payment.uuid}`);
    }

    return <OrderPaymentsView transactions={order.transactions || []} onViewPayment={handleViewPayment} />;
}