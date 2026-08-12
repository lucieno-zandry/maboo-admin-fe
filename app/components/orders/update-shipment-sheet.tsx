import { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { bulkUpdateShipmentStatus } from "~/api/http-requests";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "~/components/ui/sheet";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { StatusBadge } from "../custom-ui/status-badge";
import { getLatestShipment } from "~/lib/get-order-shipment-informations";
import type { Order, Shipment } from "wle-core";

type UpdateShipmentSheetViewProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
    status: string;
    onStatusChange: (value: string) => void;
    carrier: string;
    onCarrierChange: (value: string) => void;
    trackingNumber: string;
    onTrackingNumberChange: (value: string) => void;
    estimatedDelivery: string;
    onEstimatedDeliveryChange: (value: string) => void;
    shippedDate: string;
    onShippedDateChange: (value: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    onCancel: () => void;
    isDirty: boolean;
    errors: Record<string, string | undefined>;
    validateField: (field: string) => void;
};

export function UpdateShipmentSheetView({
    open,
    onOpenChange,
    order,
    carrier,
    estimatedDelivery,
    onCarrierChange,
    isSubmitting,
    onEstimatedDeliveryChange,
    onShippedDateChange,
    onStatusChange,
    onSubmit,
    onTrackingNumberChange,
    shippedDate,
    status,
    trackingNumber,
    onCancel,
    isDirty,
    errors,
    validateField,
}: UpdateShipmentSheetViewProps) {
    if (!order) return null;

    const latestShipment = getLatestShipment(order);
    const orderIdShort = order.uuid?.slice(0, 12);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md border-l shadow-2xl">
                <SheetHeader className="mb-4">
                    <div>
                        <SheetTitle className="text-lg font-semibold">Update Shipment</SheetTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Order</span>: {orderIdShort}{" "}
                            <span className="ml-2 inline-flex items-center">
                                {latestShipment ? (
                                    <>
                                        <StatusBadge status={latestShipment.status}>{latestShipment.status}</StatusBadge>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            Latest: {latestShipment.status.toLowerCase()}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground">No shipments yet</span>
                                )}
                            </span>
                        </p>
                    </div>
                </SheetHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                    className="space-y-6 p-4"
                    noValidate
                >
                    <fieldset className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={status}
                            onValueChange={(val) => {
                                onStatusChange(val);
                                // validate status change immediately
                                validateField("status");
                            }}
                        >
                            <SelectTrigger id="status" className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                <SelectItem value="SHIPPED">Shipped</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-destructive text-sm mt-1" role="alert">{errors.status}</p>}
                        <p className="text-xs text-muted-foreground">Change shipment lifecycle state.</p>
                    </fieldset>

                    {(status === "SHIPPED") && (
                        <div className="rounded-md border p-4 bg-muted/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Shipped details</p>
                                    <p className="text-xs text-muted-foreground">Provide carrier, tracking, and estimated delivery info.</p>
                                </div>
                                {latestShipment?.created_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Created {new Date(latestShipment.created_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="carrier">Carrier</Label>
                                <Input
                                    id="carrier"
                                    value={carrier}
                                    onChange={(e) => {
                                        onCarrierChange(e.target.value);
                                        if (errors.carrier) validateField("carrier");
                                    }}
                                    onBlur={() => validateField("carrier")}
                                    placeholder="e.g., DHL, FedEx"
                                    aria-invalid={!!errors.carrier}
                                    aria-describedby={errors.carrier ? "carrier-error" : undefined}
                                />
                                {errors.carrier && (
                                    <p id="carrier-error" className="text-destructive text-sm mt-1" role="alert">
                                        {errors.carrier}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tracking">Tracking Number</Label>
                                <Input
                                    id="tracking"
                                    value={trackingNumber}
                                    onChange={(e) => {
                                        onTrackingNumberChange(e.target.value);
                                        if (errors.trackingNumber) validateField("trackingNumber");
                                    }}
                                    onBlur={() => validateField("trackingNumber")}
                                    placeholder="Tracking number"
                                    aria-invalid={!!errors.trackingNumber}
                                    aria-describedby={errors.trackingNumber ? "tracking-error" : undefined}
                                />
                                {errors.trackingNumber && (
                                    <p id="tracking-error" className="text-destructive text-sm mt-1" role="alert">
                                        {errors.trackingNumber}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">Optional but recommended for customer support.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shipped-date">Shipped Date</Label>
                                <Input
                                    id="shipped-date"
                                    type="date"
                                    value={shippedDate}
                                    onChange={(e) => {
                                        onShippedDateChange(e.target.value);
                                        if (errors.shippedDate) validateField("shippedDate");
                                    }}
                                    onBlur={() => validateField("shippedDate")}
                                    aria-invalid={!!errors.shippedDate}
                                    aria-describedby={errors.shippedDate ? "shipped-date-error" : undefined}
                                />
                                {errors.shippedDate && (
                                    <p id="shipped-date-error" className="text-destructive text-sm mt-1" role="alert">
                                        {errors.shippedDate}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="estimated-delivery">Estimated Delivery Date</Label>
                                <Input
                                    id="estimated-delivery"
                                    type="date"
                                    value={estimatedDelivery}
                                    onChange={(e) => {
                                        onEstimatedDeliveryChange(e.target.value);
                                        if (errors.estimatedDelivery) validateField("estimatedDelivery");
                                    }}
                                    onBlur={() => validateField("estimatedDelivery")}
                                    aria-invalid={!!errors.estimatedDelivery}
                                    aria-describedby={errors.estimatedDelivery ? "estimated-error" : undefined}
                                />
                                {errors.estimatedDelivery && (
                                    <p id="estimated-error" className="text-destructive text-sm mt-1" role="alert">
                                        {errors.estimatedDelivery}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">Optional, but helpful for customers.</p>
                            </div>
                        </div>
                    )}

                    {status === "DELIVERED" && (
                        <div className="rounded-md border p-4 bg-muted/5 space-y-2">
                            <p className="text-sm font-medium">Delivery</p>
                            <p className="text-xs text-muted-foreground">Optionally confirm delivery details.</p>
                            {/* No estimated delivery field here – it's already handled under SHIPPED */}
                        </div>
                    )}

                    <SheetFooter className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => {
                                    onCancel();
                                }}
                                className="flex-1 h-11 rounded-xl"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" className="flex-1 h-11 rounded-xl" disabled={!isDirty || isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

/* ---------- Container component with field-level validation logic ---------- */

export type UpdateShipmentSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order?: Order | null;
    shipment?: Shipment | null;
    onSuccess?: () => void;
};

export default function UpdateShipmentSheet({
    open,
    onOpenChange,
    order,
    shipment,
    onSuccess,
}: UpdateShipmentSheetProps) {
    const [status, setStatus] = useState("PENDING");
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");
    const [shippedDate, setShippedDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // Derive the order from either prop
    const effectiveOrder = useMemo(() => {
        if (order) return order;
        if (shipment?.order) return shipment.order;
        return null;
    }, [order, shipment]);

    useEffect(() => {
        if (!open) return;

        // If a specific shipment is provided, use its data directly
        if (shipment) {
            setStatus(shipment.status);
            setCarrier(shipment.data?.carrier || "");
            setTrackingNumber(shipment.data?.tracking_number || "");
            setEstimatedDelivery(shipment.data?.estimated_delivery || "");
            setShippedDate(shipment.data?.shipped_date || "");
            setErrors({});
            return;
        }

        // Otherwise, use the effectiveOrder and get the latest shipment
        if (effectiveOrder) {
            const activeShipment = effectiveOrder.shipments?.find(s => s.is_active);
            const latest = activeShipment || effectiveOrder?.shipments
                ?.slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

            if (latest) {
                setStatus(latest.status);
                setCarrier(latest.data?.carrier || "");
                setTrackingNumber(latest.data?.tracking_number || "");
                setEstimatedDelivery(latest.data?.estimated_delivery || "");
                setShippedDate(latest.data?.shipped_date || "");
            } else {
                setStatus("PENDING");
                setCarrier("");
                setTrackingNumber("");
                setEstimatedDelivery("");
                setShippedDate("");
            }
            setErrors({});
        }
    }, [shipment, effectiveOrder, open]);

    const validateField = (field: string) => {
        const nextErrors = { ...errors };

        if (field === "status") {
            if (!status) nextErrors.status = "Status is required.";
            else delete nextErrors.status;
        }

        if (field === "carrier") {
            // If status is SHIPPED, carrier is optional but at least carrier or tracking must be present.
            if (status === "SHIPPED" && !carrier && !trackingNumber) {
                nextErrors.carrier = "Provide a carrier or tracking number for shipped orders.";
            } else {
                delete nextErrors.carrier;
            }
        }

        if (field === "trackingNumber") {
            if (status === "SHIPPED" && !carrier && !trackingNumber) {
                nextErrors.trackingNumber = "Provide a carrier or tracking number for shipped orders.";
            } else if (trackingNumber && trackingNumber.length < 3) {
                nextErrors.trackingNumber = "Tracking number looks too short.";
            } else {
                delete nextErrors.trackingNumber;
            }
        }

        if (field === "shippedDate") {
            if (shippedDate && isNaN(new Date(shippedDate).getTime())) {
                nextErrors.shippedDate = "Invalid shipped date.";
            } else {
                delete nextErrors.shippedDate;
            }
        }

        if (field === "estimatedDelivery") {
            // Only validate if a date is provided; otherwise it's optional.
            if (estimatedDelivery && isNaN(new Date(estimatedDelivery).getTime())) {
                nextErrors.estimatedDelivery = "Invalid date.";
            } else {
                delete nextErrors.estimatedDelivery;
            }
        }

        setErrors(nextErrors);
        return nextErrors;
    };

    // Determine dirty state by comparing current values to the latest shipment (or defaults)
    const isDirty = useMemo(() => {
        if (!effectiveOrder) return false;
        const latest = effectiveOrder.shipments
            ?.slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        const base = {
            status: latest?.status || "PROCESSING",
            carrier: latest?.data?.carrier || "",
            trackingNumber: latest?.data?.tracking_number || "",
            estimatedDelivery: latest?.data?.estimated_delivery || "",
            shippedDate: latest?.data?.shipped_date || "",
        };

        return (
            status !== base.status ||
            carrier !== base.carrier ||
            trackingNumber !== base.trackingNumber ||
            estimatedDelivery !== base.estimatedDelivery ||
            shippedDate !== base.shippedDate
        );
    }, [effectiveOrder, status, carrier, trackingNumber, estimatedDelivery, shippedDate]);

    const validateAll = () => {
        const fields = ["status", "carrier", "trackingNumber", "shippedDate", "estimatedDelivery"];
        let aggregated: Record<string, string | undefined> = {};
        fields.forEach((f) => {
            const res = validateField(f);
            aggregated = { ...aggregated, ...res };
        });
        return aggregated;
    };

    const handleSubmit = async () => {
        if (!effectiveOrder) return;

        // run validation
        const nextErrors = validateAll();
        if (Object.keys(nextErrors).length > 0) {
            // focus first error could be added here
            toast.error("Please fix the highlighted fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data: Record<string, any> = {};
            if (carrier) data.carrier = carrier;
            if (trackingNumber) data.tracking_number = trackingNumber;
            if (estimatedDelivery) data.estimated_delivery = estimatedDelivery;
            if (shippedDate) data.shipped_date = shippedDate;

            const response = await bulkUpdateShipmentStatus([effectiveOrder.uuid], status.toUpperCase(), data);

            if (response.data && response.data.updated > 0) {
                toast.success(`${response.data.updated} Shipment(s) updated successfully`);
            }

            response.data?.errors?.forEach((error: string) => {
                toast.error(error);
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to update shipment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!effectiveOrder) {
            onOpenChange(false);
            return;
        }
        const latest = effectiveOrder.shipments
            ?.slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        if (latest) {
            setStatus(latest.status);
            setCarrier(latest.data?.carrier || "");
            setTrackingNumber(latest.data?.tracking_number || "");
            setEstimatedDelivery(latest.data?.estimated_delivery || "");
            setShippedDate(latest.data?.shipped_date || "");
        } else {
            setStatus("PROCESSING");
            setCarrier("");
            setTrackingNumber("");
            setEstimatedDelivery("");
            setShippedDate("");
        }
        setErrors({});
        onOpenChange(false);
    };

    return (
        <UpdateShipmentSheetView
            open={open}
            onOpenChange={onOpenChange}
            order={effectiveOrder} // pass the computed order to the view
            status={status}
            onStatusChange={setStatus}
            carrier={carrier}
            onCarrierChange={setCarrier}
            trackingNumber={trackingNumber}
            onTrackingNumberChange={setTrackingNumber}
            estimatedDelivery={estimatedDelivery}
            onEstimatedDeliveryChange={setEstimatedDelivery}
            shippedDate={shippedDate}
            onShippedDateChange={setShippedDate}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            isDirty={isDirty}
            errors={errors}
            validateField={validateField}
        />
    );
}