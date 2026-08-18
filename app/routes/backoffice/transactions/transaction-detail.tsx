import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
    getTransaction,
    getTransactionAuditLogs,
    getTransactionWebhookLogs,
} from "~/api/http-requests";


import TransactionActionsPanel from "~/components/transaction-detail/transaction-actions-panel";
import { useTransactionDetailStore } from "~/hooks/use-transaction-detail-store";
import { OverrideStatusDialog } from "~/components/transaction-detail/override-status-dialog";
import { RefundDialog } from "~/components/transaction-detail/refund-dialog";
import { OpenDisputeDialog } from "~/components/transaction-detail/open-dispute-dialog";
import { ResolveDisputeDialog } from "~/components/transaction-detail/resolve-dispute-dialog";
import TransactionInfoCard from "~/components/transaction-detail/transaction-info-card";
import TransactionInformationsPanel from "~/components/transaction-detail/transaction-informations-panel";
import AuditLogList from "~/components/transaction-detail/audit-log-list";
import { WebhookLogList } from "~/components/transaction-detail/webhook-log-list";
import { TransactionOrderCard } from "~/components/transaction-detail/transaction-order-card";
import { TransactionUserCard } from "~/components/transaction-detail/transaction-user-card";
import TransactionSkeleton from "~/components/transaction-detail/transaction-skeleton";
import { BackButton } from "wle-ui-package";

export default function TransactionDetailPage() {
    const { transactionUuid } = useParams<{ transactionUuid: string }>();

    const {
        transaction,
        isLoading,
        error,
        auditLogsPage,
        webhookLogsPage,
        setTransaction,
        setLoading,
        setError,
        setAuditLogs,
        setAuditLogsLoading,
        setWebhookLogs,
        setWebhookLogsLoading,
    } = useTransactionDetailStore();

    // ── Load main transaction ──────────────────────────────────────────────────
    useEffect(() => {
        if (!transactionUuid) return;
        let cancelled = false;

        const fetchTransaction = async () => {
            setLoading(true);
            setError(null);
            try {
                const transaction = (await getTransaction(transactionUuid)).data?.transaction;
                if (transaction && !cancelled) setTransaction(transaction);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load transaction.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchTransaction();
        return () => { cancelled = true; };
    }, [transactionUuid]);

    // ── Load audit logs (re-fetch on page change) ──────────────────────────────
    useEffect(() => {
        if (!transactionUuid) return;
        let cancelled = false;

        const fetchAuditLogs = async () => {
            setAuditLogsLoading(true);
            try {
                const audit_logs = (await getTransactionAuditLogs(
                    transactionUuid, auditLogsPage
                )).data?.audit_logs;

                if (!cancelled && audit_logs) setAuditLogs(audit_logs);
            } finally {
                if (!cancelled) setAuditLogsLoading(false);
            }
        };

        fetchAuditLogs();
        return () => { cancelled = true; };
    }, [transactionUuid, auditLogsPage]);

    // ── Load webhook logs ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!transactionUuid) return;
        let cancelled = false;

        const fetchWebhookLogs = async () => {
            setWebhookLogsLoading(true);
            try {
                const webhook_logs = (await getTransactionWebhookLogs(
                    transactionUuid, webhookLogsPage
                )).data?.webhook_logs;

                if (webhook_logs && !cancelled) setWebhookLogs(webhook_logs);
            } finally {
                if (!cancelled) setWebhookLogsLoading(false);
            }
        };

        fetchWebhookLogs();
        return () => { cancelled = true; };
    }, [transactionUuid, webhookLogsPage]);

    // ── Render states ──────────────────────────────────────────────────────────
    if (isLoading) {
        return <TransactionSkeleton />
    }

    if (error || !transaction) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
                <p className="text-zinc-500 text-sm">{error ?? "Transaction not found."}</p>
                <BackButton />
            </div>
        );
    }

    return (
        <>
            {/* All dialogs (rendered at page level, state from store) */}
            <OverrideStatusDialog />
            <RefundDialog />
            <OpenDisputeDialog />
            <ResolveDisputeDialog />

            <div className="p-6 space-y-6 bg-background/80 backdrop-blur-md rounded-2xl h-full overflow-y-auto">
                {/* Back nav */}
                <BackButton />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    {/* ── Left column: main content ─────────────────────────────────── */}
                    <div className="space-y-4">
                        <TransactionInfoCard />
                        <TransactionInformationsPanel />
                        <AuditLogList />
                        <WebhookLogList />
                    </div>

                    {/* ── Right sidebar: context + actions ──────────────────────────── */}
                    <div className="space-y-4">
                        <TransactionActionsPanel />
                        <TransactionOrderCard />
                        <TransactionUserCard />
                    </div>
                </div>
            </div>
        </>
    );
}