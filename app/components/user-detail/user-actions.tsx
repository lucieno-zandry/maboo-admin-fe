// routes/backoffice/users/components/UserActions.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Edit, Ban, CheckCircle2, ShieldAlert } from "lucide-react";
import { isUserApproved } from "~/lib/user-status";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import type { User } from "wle-core";

interface UserActionsProps {
    user: User; // Note: Ensure User type is imported if strictly typed in your environment
    onEdit?: () => void;
    onApprove?: () => void;
    onBlock?: (reason: string) => void;
    onSuspend?: (reason: string, expiresAt?: string) => void;
}

export function UserActions({ user, onEdit, onApprove, onBlock, onSuspend }: UserActionsProps) {
    const approved = isUserApproved(user);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isBlockOpen, setIsBlockOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);

    const [blockReason, setBlockReason] = useState("");
    const [suspendReason, setSuspendReason] = useState("");
    const [suspendUntil, setSuspendUntil] = useState("");

    const handleApproveConfirm = () => {
        onApprove?.();
        setIsApproveOpen(false);
    };

    const handleBlockConfirm = () => {
        onBlock?.(blockReason);
        setIsBlockOpen(false);
        setBlockReason("");
    };

    const handleSuspendConfirm = () => {
        onSuspend?.(suspendReason, suspendUntil || undefined);
        setIsSuspendOpen(false);
        setSuspendReason("");
        setSuspendUntil("");
    };

    return (
        <div className="mt-6 flex items-center gap-2 sm:mt-0 pb-1">
            <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}>
                <Edit className="h-4 w-4" /> Edit Profile
            </Button>

            {!approved && (
                <Button variant="default" size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsApproveOpen(true)}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
            )}

            {approved && (
                <>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => setIsBlockOpen(true)}>
                        <Ban className="h-4 w-4" /> Block
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-amber-600 text-amber-600 hover:bg-amber-50" onClick={() => setIsSuspendOpen(true)}>
                        <ShieldAlert className="h-4 w-4" /> Suspend
                    </Button>
                </>
            )}

            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve {user.name}? They will gain immediate access to the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApproveConfirm}>
                            Approve User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Block Dialog */}
            <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block User</DialogTitle>
                        <DialogDescription>
                            Blocking {user.name} will immediately revoke their access. Please provide a reason for this action.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="block-reason">Reason for blocking <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="block-reason"
                                placeholder="E.g., Violation of terms of service..."
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBlockOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleBlockConfirm} disabled={!blockReason.trim()}>
                            Block User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suspend Dialog */}
            <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suspend User</DialogTitle>
                        <DialogDescription>
                            Temporarily suspend {user.name}'s account. They will not be able to log in until the suspension is lifted or expires.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="suspend-reason">Reason for suspension <span className="text-destructive">*</span></Label>
                            <Textarea
                                id="suspend-reason"
                                placeholder="E.g., Suspicious activity pending review..."
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="suspend-until">Expiration Date (Optional)</Label>
                            <Input
                                id="suspend-until"
                                type="date"
                                value={suspendUntil}
                                onChange={(e) => setSuspendUntil(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <p className="text-[13px] text-muted-foreground">Leave empty for an indefinite suspension.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>Cancel</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSuspendConfirm} disabled={!suspendReason.trim()}>
                            Suspend User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}