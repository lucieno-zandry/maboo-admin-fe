// ~/components/shipments/ShipmentsTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Skeleton } from '~/components/ui/skeleton';
import { MoreHorizontal, PackageX, Eye, Truck, FileText } from 'lucide-react';
import { formatDate } from '~/lib/format-date';
import { StatusBadge } from '../custom-ui/status-badge';
import { useShipmentsStore } from '~/hooks/use-shipments-store';
import { useNavigate } from 'react-router';
import useRouterStore from '~/hooks/use-router-store';
import type { Shipment } from 'wle-core';

// --- DUMB COMPONENT (View) ---
type ShipmentsTableViewProps = {
    shipments: Shipment[];
    loading: boolean;
    error: string | null;
    onSort: (column: keyof Shipment) => void;
    onAction: (shipment: Shipment, action: 'update-status' | 'view-details' | 'cancel') => void;
};

export function ShipmentsTableView({ shipments, loading, error, onSort, onAction }: ShipmentsTableViewProps) {
    if (error) {
        return (
            <div className="text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-500/20 text-sm">
                {error}
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-900/50">
                    <TableRow className="hover:bg-transparent border-zinc-800">
                        <TableHead className="cursor-pointer hover:text-zinc-300" onClick={() => onSort('id')}>
                            ID
                        </TableHead>
                        <TableHead>Order UUID</TableHead>
                        <TableHead className="cursor-pointer hover:text-zinc-300" onClick={() => onSort('status')}>
                            Status
                        </TableHead>
                        <TableHead>Carrier</TableHead>
                        <TableHead>Tracking #</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        // SKELETON LOADING STATE
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-zinc-800">
                                {Array.from({ length: 8 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full bg-zinc-800/50" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : shipments.length === 0 ? (
                        // EMPTY STATE
                        <TableRow>
                            <TableCell colSpan={8} className="h-48 text-center">
                                <div className="flex flex-col items-center justify-center text-zinc-500">
                                    <PackageX className="h-10 w-10 mb-3 text-zinc-700" />
                                    <p className="text-base font-medium text-zinc-400">No shipments found</p>
                                    <p className="text-sm">Try adjusting your filters or search query.</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        // DATA STATE
                        shipments.map((shipment) => (
                            <TableRow key={shipment.id} className="hover:bg-zinc-900/50 border-zinc-800 transition-colors">
                                <TableCell className="font-medium">{shipment.id}</TableCell>
                                <TableCell className="font-mono text-xs text-zinc-400">{shipment.order_uuid}</TableCell>
                                <TableCell>
                                    <StatusBadge status={shipment.status}>{shipment.status}</StatusBadge>
                                </TableCell>
                                <TableCell className="text-zinc-300">{shipment.data?.carrier || '—'}</TableCell>
                                <TableCell className="font-mono text-sm text-zinc-400">
                                    {shipment.data?.tracking_number || '—'}
                                </TableCell>
                                <TableCell className="text-zinc-400">
                                    {shipment.data?.estimated_delivery ? formatDate(shipment.data.estimated_delivery) : '—'}
                                </TableCell>
                                <TableCell className="text-zinc-400">{formatDate(shipment.created_at)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="hover:bg-zinc-800">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {shipment.is_active &&
                                                <DropdownMenuItem
                                                    onClick={() => onAction(shipment, 'update-status')}
                                                    className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                                >
                                                    <Truck className="h-4 w-4 mr-2" />
                                                    Update Status
                                                </DropdownMenuItem>}
                                            <DropdownMenuItem
                                                onClick={() => onAction(shipment, 'view-details')}
                                                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-800" />
                                            <DropdownMenuItem
                                                onClick={() => onAction(shipment, 'cancel')}
                                                className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-400/10 focus:bg-red-400/10"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Cancel Shipment
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// --- SMART COMPONENT (Container) ---
export function ShipmentsTable() {
    const { shipments, loading, error, setSorting, setUpdatingShipment, setCancellingShipment } = useShipmentsStore();
    const navigate = useNavigate();
    const { lang } = useRouterStore();

    const handleAction = (shipment: Shipment, action: 'update-status' | 'view-details' | 'cancel') => {
        switch (action) {
            case 'update-status':
                setUpdatingShipment(shipment);
                break;
            case 'view-details':
                navigate(`/${lang}/orders/${shipment.order_uuid}`)
                break;
            case 'cancel':
                setCancellingShipment(shipment);
                break;
        }
    };

    return (
        <ShipmentsTableView
            shipments={shipments}
            loading={loading}
            error={error}
            onSort={setSorting}
            onAction={handleAction}
        />
    );
}