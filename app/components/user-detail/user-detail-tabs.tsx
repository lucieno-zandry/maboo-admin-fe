import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { AddressesTab } from "./user-address-tab";
import { UserOrdersTab } from "./user-orders-tab";
import { TransactionsTab } from "./user-transactions-tab";
import { CartItemsTab } from "./user-cart-items-tab";
import { RefundRequestsTab } from "./user-refund-requests-tab";
import { AuditLogsTab } from "./user-audit-logs";
import { ReviewedTransactionsTab } from "./reviewed-transactions-tab";
import { ReviewedRefundsTab } from "./reviewed-refunds-tab";
import { UserStatusesTab } from "./user-statuses-tab";
import { UserSetStatusesTab } from "./user-set-statuses-tab";
import type { User } from "wle-core";

interface UserDetailTabsProps {
    user: User;
}

export function UserDetailTabs({ user }: UserDetailTabsProps) {
    const tabs = [
        { value: "addresses", label: "Addresses", count: user.addresses?.length || 0, component: <AddressesTab /> },
        { value: "orders", label: "Orders", count: user.orders?.length || 0, component: <UserOrdersTab /> },
        { value: "transactions", label: "Transactions", count: user.transactions?.length || 0, component: <TransactionsTab /> },
        { value: "cart", label: "Cart", count: user.cart_items?.length || 0, component: <CartItemsTab /> },
        { value: "refunds", label: "Refund Requests", count: user.refund_requests?.length || 0, component: <RefundRequestsTab /> },
        { value: "reviewed-transactions", label: "Reviewed Transactions", count: user.reviewed_transactions?.length || 0, component: <ReviewedTransactionsTab /> },
        { value: "reviewed-refunds", label: "Reviewed Refunds", count: user.reviewed_refund_requests?.length || 0, component: <ReviewedRefundsTab /> },
        { value: "audit", label: "Audit Logs", count: user.performed_transaction_audit_logs?.length || 0, component: <AuditLogsTab /> },
        { value: "statuses", label: "Statuses", count: user.statuses?.length || 0, component: <UserStatusesTab /> },
        { value: "set-statuses", label: "Set Statuses", count: user.set_statuses?.length || 0, component: <UserSetStatusesTab /> },
    ].filter(tab => tab.count > 0);

    if (tabs.length === 0) {
        return (
            <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center text-muted-foreground">
                No history, activity, or additional records found for this user.
            </div>
        );
    }

    return (
        <Tabs defaultValue={tabs[0].value} className="w-full">
            <ScrollArea className="w-full max-w-full pb-2">
                <TabsList className="h-10 w-max inline-flex p-1 bg-muted rounded-lg">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
                        >
                            {tab.label}
                            <span className="flex h-5 items-center justify-center rounded-full bg-muted px-2 text-[10px] text-muted-foreground">
                                {tab.count}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            <div className="mt-4">
                {tabs.map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="m-0 focus-visible:outline-none">
                        {tab.component}
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
}