import type { PaymentWebhookLog, Transaction, TransactionAuditLog } from "wle-core";

// Query params for list endpoint
export type TransactionsQueryParams = {
    page?: number;
    per_page?: number;
    status?: string;
    method?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
    amount_min?: number | string;
    amount_max?: number | string;
    search?: string;
    order_uuid?: string;
    dispute_status?: string;
    sort_by?: "created_at" | "amount" | "status";
    sort_dir?: "asc" | "desc";
    reviewed?: "yes" | "no";
};

export type TransactionsResponse = {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
};

export type TransactionDetailResponse = {
    transaction: Transaction;
};

export type AuditLogsResponse = {
    audit_logs: {
        data: TransactionAuditLog[];
        current_page: number;
        last_page: number;
        total: number;
    };
};

export type WebhookLogsResponse = {
    webhook_logs: {
        data: PaymentWebhookLog[];
        current_page: number;
        last_page: number;
        total: number;
    };
};