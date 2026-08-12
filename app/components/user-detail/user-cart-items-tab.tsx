import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ShoppingCart, ExternalLink, Trash2, Package } from "lucide-react";
import type { CartItem } from "wle-core";

function CartItemsView({ items }: { items: CartItem[] }) {
    const cartTotal = items.reduce((acc, item) => acc + Number(item.total), 0);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    Active Cart
                </CardTitle>
                <div className="text-sm font-medium">
                    Total: <span className="text-lg">${cartTotal.toFixed(2)}</span>
                </div>
            </CardHeader>
            <div className="flex flex-col">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 transition-colors hover:bg-muted/30 ${index !== items.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="h-12 w-12 shrink-0 rounded-md bg-muted border flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <p className="font-semibold text-sm truncate pr-4">
                                    {item.product_snapshot.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-mono">SKU: {item.variant_snapshot.sku}</span>
                                    <span>•</span>
                                    <span>Qty: <Badge variant="secondary" className="px-1 py-0">{item.count}</Badge></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                            <div className="text-left sm:text-right">
                                <p className="font-semibold">${Number(item.total).toFixed(2)}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    ${(Number(item.total) / item.count).toFixed(2)} each
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8" title="View Product">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" title="Remove Item">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function CartItemsTab() {
    const { user } = useUserDetailStore();
    if (!user?.cart_items?.length) return null;
    return <CartItemsView items={user.cart_items} />;
}