import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useOrderDetailStore } from "~/hooks/use-order-detail-store";
import formatPrice from "~/lib/format-price";
import { Separator } from "~/components/ui/separator";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { formatFullAddress } from "~/lib/format-full-address";
import type { Address, Order } from "wle-core";

export type OrderSummaryViewProps = {
    user: { name: string; email: string; avatarUrl?: string; id: number } | null;
    address: Address;
    coupon: Order['coupon_snapshot'];
    couponDiscount: number;
    shippingCost: number;
    shippingMethodName?: string;
    total: number;
};

export function OrderSummaryView({
    user,
    address,
    coupon,
    couponDiscount,
    shippingCost,
    shippingMethodName,
    total,
}: OrderSummaryViewProps) {
    // Calculate subtotal (sum of item prices before any discounts or shipping)
    const subtotal = total + couponDiscount - shippingCost;

    return (
        <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        {shippingCost > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                                <span>
                                    Shipping
                                    {shippingMethodName && ` (${shippingMethodName})`}
                                </span>
                                <span>{formatPrice(shippingCost)}</span>
                            </div>
                        )}
                        {coupon && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount ({coupon.code})</span>
                                <span>-{formatPrice(couponDiscount)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium text-base">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
                <CardHeader className="flex justify-between">
                    <CardTitle className="text-lg">Customer</CardTitle>
                    {user && (
                        <Button
                            variant="outline"
                            size="sm"
                            aria-describedby="Open user profile"
                            asChild
                        >
                            <Link to={`../users/${user.id}`}>
                                <ExternalLink />
                            </Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{user.name}</span>
                                <span className="text-sm text-muted-foreground">{user.email}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No customer data</p>
                    )}
                </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                    <address className="not-italic text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">{address.recipient_name}</p>
                        <p>{formatFullAddress(address)}</p>
                        <p className="pt-2">
                            📞 {address.phone}
                            {address.phone_alt && ` (alt: ${address.phone_alt})`}
                        </p>
                        {address.label && (
                            <p className="text-xs text-muted-foreground/70">Label: {address.label}</p>
                        )}
                    </address>
                </CardContent>
            </Card>
        </div>
    );
}

// ===== CONTAINER =====
export default function OrderSummary() {
    const { order } = useOrderDetailStore();
    if (!order) return null;

    const user = order.user
        ? {
            name: order.user.name,
            email: order.user.email,
            avatarUrl: order.user.avatar_image?.url,
            id: order.user.id,
        }
        : null;

    const shippingCost = order.shipping_cost ?? 0;
    const shippingMethodName = order.shipping_method_snapshot?.name;

    return (
        <OrderSummaryView
            user={user}
            address={order.address_snapshot}
            coupon={order.coupon_snapshot}
            couponDiscount={order.coupon_discount_applied}
            shippingCost={shippingCost}
            shippingMethodName={shippingMethodName}
            total={order.total}
        />
    );
}