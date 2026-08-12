import type { Order, Transaction } from "wle-core";

export const getLatestPayment = (order: Order): Transaction | null => {
    if (!order.transactions || order.transactions.length === 0) return null;

    const latest = order.transactions.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return latest;
}

export const getPaymentStatus = (order: Order) => {
    const latest = getLatestPayment(order);
    if (!latest) return "pending";

    return latest.status.toLowerCase();
};
