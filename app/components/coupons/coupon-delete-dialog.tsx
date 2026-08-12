// ~/components/coupons/coupon-delete-dialog.tsx
import { Trash2, Loader2 } from "lucide-react";
import type { Coupon } from "wle-core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

// ── Single delete ─────────────────────────────────────────────────────────────

export type CouponDeleteDialogProps = {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
};

export function CouponDeleteDialog({
  coupon,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: CouponDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete coupon{" "}
            <span className="font-mono font-semibold">{coupon?.code}</span>?
            This action cannot be undone. Orders using this coupon will keep
            their applied discount, but no new redemptions will be possible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Bulk delete ───────────────────────────────────────────────────────────────

export type CouponBulkDeleteDialogProps = {
  count: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
};

export function CouponBulkDeleteDialog({
  count,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: CouponBulkDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {count} coupons?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {count} coupon
            {count !== 1 ? "s" : ""}. This action cannot be undone. Existing
            orders that applied these coupons will be unaffected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete {count} coupons
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}