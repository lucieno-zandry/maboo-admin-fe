import { useState, useRef } from 'react';
import { reorderLandingBlocks } from '~/api/http-requests';
import { useLandingBlocksStore } from '../stores/use-landing-blocks-store';
import type { LandingBlock } from 'wle-core';

export function useReorderLandingBlocks() {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { reorderBlocks } = useLandingBlocksStore();
    // Keep a snapshot of the order before drag to rollback on error
    const snapshotRef = useRef<LandingBlock[]>([]);

    const beginDrag = (currentBlocks: LandingBlock[]) => {
        snapshotRef.current = [...currentBlocks];
    };

    const commitReorder = async (newBlocks: LandingBlock[]) => {
        reorderBlocks(newBlocks);
        setIsSaving(true);
        setError(null);
        try {
            await reorderLandingBlocks({
                blocks: newBlocks.map((b, index) => ({ id: b.id, display_order: index })),
            });
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save new order');
            // Rollback
            reorderBlocks(snapshotRef.current);
        } finally {
            setIsSaving(false);
        }
    };

    return { commitReorder, beginDrag, isSaving, error };
}