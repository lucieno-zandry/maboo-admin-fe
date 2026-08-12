// ~/components/coupons/coupon-usage-orders.tsx
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { Link, useParams } from "react-router";
import type { Order } from "wle-core";

export type CouponUsageOrdersProps = {
  orders: Order[] | undefined;
  loading: boolean;
  couponDiscount: number;
  couponType: "FIXED_AMOUNT" | "PERCENTAGE";
};

export function CouponUsageOrders({
  orders,
  loading,
  couponDiscount,
  couponType,
}: CouponUsageOrdersProps) {
  const { lang } = useParams();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border rounded-xl border-dashed text-muted-foreground">
        <ShoppingBag className="h-6 w-6 mb-2 opacity-30" />
        <p className="text-xs">No orders have used this coupon yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {orders.map((order) => (
        <div
          key={order.uuid}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group"
        >
          {/* User avatar */}
          {order.user && (
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={order.user.avatar_image?.url} />
              <AvatarFallback className="text-[10px]">
                {order.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Order info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-medium truncate">
                #{order.uuid.slice(0, 8).toUpperCase()}
              </span>
              {order.user && (
                <span className="text-xs text-muted-foreground truncate">
                  · {order.user.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">
                {format(new Date(order.created_at), "MMM d, yyyy")}
              </span>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  order.coupon_discount_applied > 0
                    ? "text-emerald-600"
                    : "text-muted-foreground"
                )}
              >
                −{order.coupon_discount_applied.toLocaleString()} saved
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold">
              {order.total.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">total</p>
          </div>

          {/* Link */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
            asChild
          >
            <Link to={`/${lang}/orders/${order.uuid}`}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}