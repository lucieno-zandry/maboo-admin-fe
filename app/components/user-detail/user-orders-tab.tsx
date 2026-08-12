import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Package, ExternalLink, Truck } from "lucide-react";
import { Link } from "react-router";
import type { Order } from "wle-core";

function OrdersView({ orders }: { orders: Order[] }) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    Order History
                </CardTitle>
            </CardHeader>
            <div className="flex flex-col">
                {orders.map((order, index) => (
                    <div
                        key={order.uuid}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 transition-colors hover:bg-muted/30 ${index !== orders.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">#{order.uuid.split('-')[0]}</span>
                                {/* Placeholder status badge - update with real data if available */}
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background">
                                    Completed
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-muted-foreground mb-0.5">Order Total</p>
                                <p className="font-semibold">${Number(order.total).toFixed(2)}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button variant="outline" size="sm" className="hidden lg:flex gap-2" asChild>
                                    <Link to={`../../shipments?search=${order.uuid}`}>
                                        <Truck className="h-4 w-4" /> Track
                                    </Link>
                                </Button>
                                <Button size="sm" variant="secondary" className="gap-2" asChild>
                                    <Link to={`../../orders/${order.uuid}`}>
                                        <ExternalLink className="h-4 w-4" /> View
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function UserOrdersTab() {
    const { user } = useUserDetailStore();
    if (!user?.orders?.length) return null;
    return <OrdersView orders={user.orders} />;
}