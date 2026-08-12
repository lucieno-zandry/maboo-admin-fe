import { useEffect, useState } from 'react';
import { useOrderDetailStore } from '~/hooks/use-order-detail-store';
import { getRefundRequests, approveRefundRequest, rejectRefundRequest } from '~/api/http-requests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { format } from 'date-fns';
import formatPrice from '~/lib/format-price';
import { toast } from 'sonner';
import { StatusBadge } from '~/components/custom-ui/status-badge';
import { useRevalidator } from 'react-router';
import ApproveRefundDialog from '../refunds/refund-action-dialog';
import RejectRefundDialog from '../refunds/reject-refund-dialog';
import type { RefundRequest } from 'wle-core';

// ===== VIEW =====
export type OrderRefundRequestsViewProps = {
    requests: RefundRequest[];
    onApprove: (uuid: string) => void;
    onReject: (uuid: string) => void;
    isProcessing: boolean;
};

export function OrderRefundRequestsView({
    requests,
    onApprove,
    onReject,
    isProcessing,
}: OrderRefundRequestsViewProps) {
    if (requests.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No refund requests.
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {requests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell>{format(new Date(req.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                            <TableCell className="max-w-xs truncate">{req.reason}</TableCell>
                            <TableCell>{formatPrice(req.amount)}</TableCell>
                            <TableCell>
                                <StatusBadge status={req.status}>{req.status}</StatusBadge>
                            </TableCell>
                            <TableCell className="text-right">
                                {req.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onApprove(req.uuid)}
                                            disabled={isProcessing}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => onReject(req.uuid)}
                                            disabled={isProcessing}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ===== CONTAINER =====
export default function OrderRefundRequests() {
    const { order } = useOrderDetailStore();
    const [processing, setProcessing] = useState(false);
    const revalidator = useRevalidator();

    // Dialog state
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        requestUuid: string | null;
        action: 'approve' | 'reject' | null;
    }>({
        open: false,
        requestUuid: null,
        action: null,
    });

    const handleApproveClick = (uuid: string) => {
        setDialogState({ open: true, requestUuid: uuid, action: 'approve' });
    };

    const handleRejectClick = (uuid: string) => {
        setDialogState({ open: true, requestUuid: uuid, action: 'reject' });
    };

    const handleApproveConfirm = async () => {
        if (!dialogState.requestUuid) return;
        setProcessing(true);
        try {
            await approveRefundRequest(dialogState.requestUuid);
            toast.success('Refund request approved');
            revalidator.revalidate();
            setDialogState({ open: false, requestUuid: null, action: null });
        } catch (error) {
            toast.error('Failed to approve request');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectConfirm = async () => {
        if (!dialogState.requestUuid) return;
        setProcessing(true);
        try {
            await rejectRefundRequest(dialogState.requestUuid);
            toast.success('Refund request rejected');
            revalidator.revalidate();
            setDialogState({ open: false, requestUuid: null, action: null });
        } catch (error) {
            toast.error('Failed to reject request');
        } finally {
            setProcessing(false);
        }
    };

    if (!order) return null;
    const { refund_requests: requests = [] } = order;

    return (
        <>
            <OrderRefundRequestsView
                requests={requests}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                isProcessing={processing}
            />

            {dialogState.action === 'approve' && (
                <ApproveRefundDialog
                    open={dialogState.open}
                    onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
                    onConfirm={handleApproveConfirm}
                    isProcessing={processing}
                />
            )}

            {dialogState.action === 'reject' && (
                <RejectRefundDialog
                    open={dialogState.open}
                    onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
                    onConfirm={handleRejectConfirm}
                    isProcessing={processing}
                />
            )}
        </>
    );
}