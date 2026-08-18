import { useOrderDetailStore } from "~/hooks/use-order-detail-store";
import { format } from "date-fns";
import formatPrice from "~/lib/format-price";
import { StatusBadge } from "../custom-ui/status-badge";
import { BackButton } from "wle-ui-package";

export default function OrderDetailHeader() {
    const { order } = useOrderDetailStore();
    if (!order) return null;

    const paymentStatus = order.transactions?.length
        ? order.transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].status.toLowerCase()
        : "pending";
    const shipmentStatus = order.shipments?.length
        ? order.shipments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].status.toLowerCase()
        : "pending";

    return (
        <OrderDetailHeaderView
            uuid={order.uuid}
            createdAt={order.created_at}
            total={order.total}
            paymentStatus={paymentStatus}
            shipmentStatus={shipmentStatus}
        />
    );
}



export type OrderDetailHeaderViewProps = {
    uuid: string;
    createdAt: string;
    total: number;
    paymentStatus: string;
    shipmentStatus: string;
};

export function OrderDetailHeaderView({
    uuid,
    createdAt,
    total,
    paymentStatus,
    shipmentStatus,
}: OrderDetailHeaderViewProps) {
    return (
        <>
            <BackButton />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-mono">Order {uuid}</h1>
                    <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(createdAt), "PPP")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={paymentStatus}>
                        {paymentStatus === "success" ? "Paid" : paymentStatus}
                    </StatusBadge>
                    <StatusBadge status={shipmentStatus}>
                        {shipmentStatus}
                    </StatusBadge>
                    <div className="text-xl font-semibold ml-4">{formatPrice(total)}</div>
                </div>
            </div>
        </>
    );
}