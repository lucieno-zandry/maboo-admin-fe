import { Link } from "react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useOrderDetailStore } from "~/hooks/use-order-detail-store";
import formatPrice from "~/lib/format-price";
import { ImageOff } from "lucide-react";
import useRouterStore from "~/hooks/use-router-store";
import type { CartItem } from "wle-core";

// ===== VIEW =====
export type OrderItemsTableViewProps = {
    items: CartItem[];
    lang: string;
};

export function OrderItemsTableView({ items, lang }: OrderItemsTableViewProps) {
    if (items.length === 0) {
        return <div className="border rounded-lg p-8 text-center text-muted-foreground">No items in this order.</div>;
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Options</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                {item.product_snapshot.main_image ? (
                                    <img
                                        src={item.product_snapshot.main_image}
                                        alt={item.product_snapshot.title}
                                        className="w-10 h-10 rounded object-cover border"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                        <ImageOff className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Link
                                    to={`/${lang}/products/${item.product_snapshot.slug}`}
                                    className="font-medium hover:underline"
                                >
                                    {item.product_snapshot.title}
                                </Link>
                                <p className="text-xs text-muted-foreground">{item.product_snapshot.slug}</p>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{item.variant_snapshot.sku}</TableCell>
                            <TableCell>
                                {Object.entries(item.variant_options_snapshot).map(([group, value]) => (
                                    <div key={group} className="text-xs">
                                        <span className="font-medium">{group}:</span> {value}
                                    </div>
                                ))}
                            </TableCell>
                            <TableCell className="text-right">{formatPrice(item.unit_price)}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right font-medium">{formatPrice(item.total)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ===== CONTAINER =====
export default function OrderItemsTable() {
    const { order } = useOrderDetailStore();
    const { lang } = useRouterStore();

    if (!order) return null;

    return <OrderItemsTableView items={order.cart_items || []} lang={lang} />;
}