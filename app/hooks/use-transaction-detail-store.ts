import type { PaymentWebhookLog, Transaction, TransactionAuditLog } from "wle-core";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { AuditLogsResponse, WebhookLogsResponse } from "~/types/transactions";

type DialogType =
    | "override-status"
    | "refund"
    | "open-dispute"
    | "resolve-dispute"
    | null;

type TransactionDetailState = {
    transaction: Transaction | null;
    isLoading: boolean;
    error: string | null;

    auditLogs: TransactionAuditLog[];
    auditLogsLoading: boolean;
    auditLogsPage: number;
    auditLogsTotal: number;

    webhookLogs: PaymentWebhookLog[];
    webhookLogsLoading: boolean;
    webhookLogsPage: number;
    webhookLogsTotal: number;

    // Active dialog
    openDialog: DialogType;

    // Submitting state for any action
    isSubmitting: boolean;
    submitError: string | null;

    // Raw JSON panel expanded
    informationsExpanded: boolean;
};

type TransactionDetailActions = {
    setTransaction: (t: Transaction) => void;
    setLoading: (v: boolean) => void;
    setError: (e: string | null) => void;

    setAuditLogs: (data: AuditLogsResponse["audit_logs"]) => void;
    setAuditLogsLoading: (v: boolean) => void;
    setAuditLogsPage: (p: number) => void;

    setWebhookLogs: (data: WebhookLogsResponse["webhook_logs"]) => void;
    setWebhookLogsLoading: (v: boolean) => void;
    setWebhookLogsPage: (p: number) => void;

    setOpenDialog: (d: DialogType) => void;
    closeDialog: () => void;

    setSubmitting: (v: boolean) => void;
    setSubmitError: (e: string | null) => void;

    toggleInformations: () => void;

    // Optimistic update after an action succeeds
    patchTransaction: (patch: Partial<Transaction>) => void;
};

export const useTransactionDetailStore = create<
    TransactionDetailState & TransactionDetailActions
>()(
    immer((set) => ({
        transaction: null,
        isLoading: false,
        error: null,

        auditLogs: [],
        auditLogsLoading: false,
        auditLogsPage: 1,
        auditLogsTotal: 0,

        webhookLogs: [],
        webhookLogsLoading: false,
        webhookLogsPage: 1,
        webhookLogsTotal: 0,

        openDialog: null,
        isSubmitting: false,
        submitError: null,
        informationsExpanded: false,

        setTransaction: (t) => set((s) => { s.transaction = t; }),
        setLoading: (v) => set((s) => { s.isLoading = v; }),
        setError: (e) => set((s) => { s.error = e; }),

        setAuditLogs: (data) =>
            set((s) => {
                s.auditLogs = data.data;
                s.auditLogsTotal = data.total;
            }),
        setAuditLogsLoading: (v) => set((s) => { s.auditLogsLoading = v; }),
        setAuditLogsPage: (p) => set((s) => { s.auditLogsPage = p; }),

        setWebhookLogs: (data) =>
            set((s) => {
                s.webhookLogs = data.data;
                s.webhookLogsTotal = data.total;
            }),
        setWebhookLogsLoading: (v) => set((s) => { s.webhookLogsLoading = v; }),
        setWebhookLogsPage: (p) => set((s) => { s.webhookLogsPage = p; }),

        setOpenDialog: (d) => set((s) => { s.openDialog = d; s.submitError = null; }),
        closeDialog: () => set((s) => { s.openDialog = null; s.submitError = null; }),

        setSubmitting: (v) => set((s) => { s.isSubmitting = v; }),
        setSubmitError: (e) => set((s) => { s.submitError = e; }),

        toggleInformations: () =>
            set((s) => { s.informationsExpanded = !s.informationsExpanded; }),

        patchTransaction: (patch) =>
            set((s) => {
                if (s.transaction) Object.assign(s.transaction, patch);
            }),
    }))
);