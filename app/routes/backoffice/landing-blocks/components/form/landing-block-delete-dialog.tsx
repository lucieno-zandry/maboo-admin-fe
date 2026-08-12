import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS } from '../../helpers/data';
import { useLandingBlockDeleteDialogStore } from '../../stores/use-landing-block-delete-dialog-store';
import { useDeleteLandingBlock } from '../../hooks/use-delete-landing-block';
import type { LandingBlock } from 'wle-core';

// ── Dumb View ─────────────────────────────────────────────────────────────────

type LandingBlockDeleteDialogViewProps = {
    isOpen: boolean;
    blockType: string | null;
    isDeleting: boolean;
    error: string | null;
    onClose: () => void;
    onConfirm: () => void;
};

function LandingBlockDeleteDialogView({
    isOpen,
    blockType,
    isDeleting,
    error,
    onClose,
    onConfirm,
}: LandingBlockDeleteDialogViewProps) {
    const typeLabel = blockType
        ? BLOCK_TYPE_LABELS[blockType as LandingBlock['block_type']]
        : 'this block';
    const typeIcon = blockType ? BLOCK_TYPE_ICONS[blockType as LandingBlock['block_type']] : '⬛';

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <span className="text-lg">{typeIcon}</span>
                        </div>
                        <AlertDialogTitle>Delete {typeLabel}?</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>
                        This action cannot be undone. The block will be permanently removed from your
                        landing page.
                    </AlertDialogDescription>
                    {error && (
                        <p className="text-sm text-destructive mt-2 font-medium">{error}</p>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete block
                            </>
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ── Smart Component ───────────────────────────────────────────────────────────

export function LandingBlockDeleteDialog() {
    const { isOpen, blockId, blockType, close } = useLandingBlockDeleteDialogStore();
    const { deleteBlock, isDeleting, error } = useDeleteLandingBlock();

    const handleConfirm = () => {
        if (blockId !== null) deleteBlock(blockId);
    };

    return (
        <LandingBlockDeleteDialogView
            isOpen={isOpen}
            blockType={blockType}
            isDeleting={isDeleting}
            error={error}
            onClose={close}
            onConfirm={handleConfirm}
        />
    );
}