import { useNavigate } from "react-router";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Copy, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useOrdersStore } from "~/hooks/use-orders-store";
import formatPrice from "~/lib/format-price";
import { Checkbox } from "../ui/checkbox";
import useRouterStore from "~/hooks/use-router-store";
import { getLatestPayment, getPaymentStatus } from "~/lib/get-order-payment-informations";
import { getShipmentStatus } from "~/lib/get-order-shipment-informations";
import type { Order, Transaction } from "wle-core";


const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
        success: "bg-green-100 text-green-800",
        paid: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        shipped: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
    };
    const defaultVariant = "bg-gray-100 text-gray-800";
    return (
        <Badge className={variants[status] || defaultVariant}>
            {status}
        </Badge>
    );
};

export type OrdersTableViewProps = {
    orders: Order[];
    loading: boolean;
    pagination: { perPage: number };
    currentSort: string;
    onSort: (field: string) => void;
    onViewDetails: (order: Order) => void;
    onUpdateShipment: (order: Order) => void;
    onCancelOrder: (order: Order) => void;
    selectedIds: Set<string>;
    onToggleSelect: (uuid: string) => void;
    onToggleSelectAll: () => void;
    allIdsOnPage: string[];
    onViewTransaction: (transaction: Transaction) => void;
};

export function OrdersTableView({
    orders,
    loading,
    pagination,
    currentSort,
    onSort,
    onViewDetails,
    onUpdateShipment,
    onCancelOrder,
    allIdsOnPage,
    onToggleSelect,
    onToggleSelectAll,
    selectedIds,
    onViewTransaction,
}: OrdersTableViewProps) {
    if (loading) {
        return (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">UUID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Shipment</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: pagination.perPage }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No orders found.
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8">
                            <Checkbox
                                checked={orders.length > 0 && selectedIds.size === orders.length}
                                onCheckedChange={onToggleSelectAll}
                                aria-label="Select all"
                            />
                        </TableHead>
                        <TableHead className="w-[100px]">UUID</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSort("created_at")}>
                            Date {currentSort === "created_at" && "↑"}{currentSort === "-created_at" && "↓"}
                        </TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => onSort("total")}>
                            Total {currentSort === "total" && "↑"}{currentSort === "-total" && "↓"}
                        </TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Shipment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => {
                        const paymentStatus = getPaymentStatus(order);
                        const shipmentStatus = getShipmentStatus(order);
                        const latestPayment = getLatestPayment(order);

                        return (
                            <TableRow
                                key={order.uuid}
                                className="group transition-colors" // Added group for hover effects
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(order.uuid)}
                                        onCheckedChange={() => onToggleSelect(order.uuid)}
                                    />
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        #{order.uuid.slice(0, 8)}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => navigator.clipboard.writeText(order.uuid)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy")}</TableCell>
                                <TableCell>
                                    {order.user ? (
                                        <div>
                                            <div>{order.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                        </div>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>{formatPrice(order.total)}</TableCell>
                                <TableCell>{statusBadge(paymentStatus)}</TableCell>
                                <TableCell>{statusBadge(shipmentStatus)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetails(order)}>
                                                View details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onUpdateShipment(order)}>
                                                Update shipment
                                            </DropdownMenuItem>
                                            {latestPayment &&
                                                <DropdownMenuItem onClick={() => onViewTransaction(latestPayment)}>
                                                    View transaction
                                                </DropdownMenuItem>}
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => onCancelOrder(order)}
                                            >
                                                Cancel order
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

export type OrdersTableProps = {
    currentSort: string;
    onSort: (field: string) => void;
    selectedIds: Set<string>;
    onToggleSelect: (uuid: string) => void;
    onToggleSelectAll: () => void;
    allIdsOnPage: string[];
    onUpdateShipmentClick: (order: Order) => void;  // new
};

export default function OrdersTable({
    currentSort,
    onSort,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    allIdsOnPage,
    onUpdateShipmentClick
}: OrdersTableProps) {
    const { orders, loading, pagination } = useOrdersStore();
    const navigate = useNavigate();
    const { lang } = useRouterStore();

    const handleViewDetails = (order: Order) => {
        navigate(`/${lang}/orders/${order.uuid}`);
    };

    const handleCancelOrder = (order: Order) => {
        console.log('Cancel order', order.uuid);
    };

    const onViewTransaction = (transaction: Transaction) => {
        navigate(`/${lang}/transactions/${transaction.uuid}`)
    }

    return (
        <OrdersTableView
            orders={orders}
            loading={loading}
            pagination={pagination}
            currentSort={currentSort}
            onSort={onSort}
            onViewDetails={handleViewDetails}
            onUpdateShipment={onUpdateShipmentClick}
            onCancelOrder={handleCancelOrder}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onToggleSelectAll={onToggleSelectAll}
            allIdsOnPage={allIdsOnPage}
            onViewTransaction={onViewTransaction}
        />
    );
}