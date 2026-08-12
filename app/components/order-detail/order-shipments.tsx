import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { useOrderDetailStore } from "~/hooks/use-order-detail-store";
import type { Shipment } from "wle-core";

export type OrderShipmentsViewProps = {
    shipments: Shipment[];
};

export function OrderShipmentsView({ shipments }: OrderShipmentsViewProps) {
    if (shipments.length === 0) {
        return <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">No shipment history yet.</div>;
    }

    const sorted = [...shipments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg tracking-tight">Shipment Activity</h3>

            <div className="relative border-l border-muted-foreground/20 ml-3 space-y-8 py-2">
                {sorted.map((shipment, index) => (
                    <div key={shipment.id} className="relative pl-6">
                        {/* Timeline Node */}
                        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize">{shipment.status}</Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(shipment.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                        </div>

                        {shipment.data && (
                            <div className="mt-3 grid gap-1 text-sm text-muted-foreground bg-muted/40 p-3 rounded-md">
                                {shipment.data.carrier && (
                                    <p><strong className="font-medium text-foreground">Carrier:</strong> {shipment.data.carrier}</p>
                                )}
                                {shipment.data.tracking_number && (
                                    <p><strong className="font-medium text-foreground">Tracking:</strong> {shipment.data.tracking_number}</p>
                                )}
                                {shipment.data.estimated_delivery && (
                                    <p><strong className="font-medium text-foreground">Est. Delivery:</strong> {format(new Date(shipment.data.estimated_delivery), "MMM d, yyyy")}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function OrderShipments() {
    const { order } = useOrderDetailStore();
    if (!order) return null;
    return <OrderShipmentsView shipments={order.shipments || []} />;
}