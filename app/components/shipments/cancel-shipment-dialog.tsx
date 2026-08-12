// ~/components/shipments/CancelShipmentDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useShipmentsStore } from '~/hooks/use-shipments-store';
import { useState } from 'react';
import { deleteShipment } from '~/api/http-requests';
import { toast } from 'sonner';
import type { Shipment } from 'wle-core';

// --- DUMB COMPONENT (View) ---
type CancelShipmentDialogViewProps = {
    isOpen: boolean;
    shipment: Shipment | null;
    isCancelling: boolean;
    onClose: () => void;
    onConfirm: (shipmentId: number) => void;
};

export function CancelShipmentDialogView({
    isOpen,
    shipment,
    isCancelling,
    onClose,
    onConfirm,
}: CancelShipmentDialogViewProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <DialogTitle className="text-zinc-100">Cancel Shipment</DialogTitle>
                    </div>
                    <DialogDescription className="text-zinc-400">
                        Are you sure you want to cancel this shipment? This action cannot be undone and the carrier will be notified.
                    </DialogDescription>
                </DialogHeader>

                {shipment && (
                    <div className="my-4 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Order UUID:</span>
                            <span className="font-mono text-zinc-300">{shipment.order_uuid}</span>
                        </div>
                        {shipment.data?.tracking_number && (
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Tracking:</span>
                                <span className="font-mono text-zinc-300">{shipment.data.tracking_number}</span>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:space-x-0 space-x-2  ">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isCancelling}
                        className="hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        Keep Shipment
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => shipment && onConfirm(shipment.id)}
                        disabled={isCancelling || !shipment}
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Yes, Cancel Shipment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- SMART COMPONENT (Container) ---
export function CancelShipmentDialog(props: { onSuccess?: () => void }) {
    const { cancellingShipment, setCancellingShipment } = useShipmentsStore();
    const [isCancelling, setIsCancelling] = useState(false);

    const cancelShipment = async (id: number) => {
        try {
            setIsCancelling(true);
            await deleteShipment(id);
            toast.success("Shipment Cancelled successfully!");
            props.onSuccess?.();
            setCancellingShipment(null);
        } catch (e) {
            toast.error("Failed to cancel shipment!");
            console.error(e);
        } finally {
            setIsCancelling(false);
        }
    }

    return (
        <CancelShipmentDialogView
            isOpen={!!cancellingShipment}
            shipment={cancellingShipment}
            isCancelling={isCancelling}
            onClose={() => setCancellingShipment(null)}
            onConfirm={cancelShipment}
        />
    );
}