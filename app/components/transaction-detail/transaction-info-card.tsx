import { Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TransactionStatusBadge from "../transactions/transaction-status-badge";
import TransactionTypeBadge from "../transactions/transaction-type-badge";
import { DisputeStatusBadge } from "../transactions/dispute-status-badge";
import formatPrice from "~/lib/format-price";
import TransactionMethodBadge from "../transactions/transaction-method-badge";
import { formatDate } from "~/lib/format-date";
import { useTransactionDetailStore } from "~/hooks/use-transaction-detail-store";
import { toast } from "sonner";
import type { Transaction } from "wle-core";

export type TransactionInfoCardViewProps = {
    transaction: Transaction;
    onCopyUuid: () => void;
};

export function TransactionInfoCardView({
    transaction: t,
    onCopyUuid,
}: TransactionInfoCardViewProps) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-medium text-zinc-100">
                            Transaction #{t.uuid}
                        </CardTitle>
                        <button
                            onClick={onCopyUuid}
                            className="flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            {t.uuid}
                            <Copy className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <TransactionStatusBadge status={t.status} />
                        <TransactionTypeBadge type={t.type} />
                        {t.dispute_status && (
                            <DisputeStatusBadge status={t.dispute_status} />
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                        <dt className="text-xs text-zinc-500 mb-0.5">Amount</dt>
                        <dd className="font-mono font-bold text-xl text-zinc-100 tabular-nums">
                            {formatPrice(t.amount)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-zinc-500 mb-0.5">Method</dt>
                        <dd>
                            <TransactionMethodBadge method={t.payment_method} />
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-zinc-500 mb-0.5">Created</dt>
                        <dd className="text-zinc-300">{formatDate(t.created_at)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-zinc-500 mb-0.5">Updated</dt>
                        <dd className="text-zinc-300">{formatDate(t.updated_at)}</dd>
                    </div>
                    {t.payment_reference && (
                        <div className="col-span-2">
                            <dt className="text-xs text-zinc-500 mb-0.5">Payment reference</dt>
                            <dd className="font-mono text-xs text-zinc-300">{t.payment_reference}</dd>
                        </div>
                    )}
                    {t.reviewed_at && (
                        <div>
                            <dt className="text-xs text-zinc-500 mb-0.5">Reviewed at</dt>
                            <dd className="text-zinc-300 text-xs">{formatDate(t.reviewed_at)}</dd>
                        </div>
                    )}
                    {t.deleted_at && (
                        <div>
                            <dt className="text-xs text-zinc-500 mb-0.5">Voided at</dt>
                            <dd className="text-red-400 text-xs">{formatDate(t.deleted_at)}</dd>
                        </div>
                    )}
                    {t.notes && (
                        <div className="col-span-2">
                            <dt className="text-xs text-zinc-500 mb-0.5">Notes</dt>
                            <dd className="text-zinc-300 text-sm">{t.notes}</dd>
                        </div>
                    )}
                    {t.informations?.payment_url && (
                        <div className="col-span-2">
                            <dt className="text-xs text-zinc-500 mb-1">Payment URL</dt>
                            <dd>
                                <a
                                    href={decodeURIComponent(t.informations.payment_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-mono break-all"
                                >
                                    Open payment page
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                            </dd>
                        </div>
                    )}
                </dl>
            </CardContent>
        </Card>
    );
}

// ─── Smart ────────────────────────────────────────────────────────────────────

export default function TransactionInfoCard() {
    const transaction = useTransactionDetailStore((s) => s.transaction);
    if (!transaction) return null;

    const handleCopyUuid = () => {
        navigator.clipboard.writeText(transaction.uuid);
        toast.success("UUID copied to clipboard.");
    };

    return (
        <TransactionInfoCardView
            transaction={transaction}
            onCopyUuid={handleCopyUuid}
        />
    );
}