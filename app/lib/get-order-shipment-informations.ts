import type { Order, Shipment } from "wle-core";

export const getLatestShipment = (order: Order): Shipment | null => {
    if (!order.shipments || order.shipments.length === 0) return null;

    const latest = order.shipments.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return latest;
};


export const getShipmentStatus = (order: Order) => {
    const latest = getLatestShipment(order);
    if (!latest) return "unprocessed";
    return latest.status.toLowerCase();
};
