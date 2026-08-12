import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { LayoutList } from 'lucide-react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { LandingBlockListItem } from './landing-block-list-item';
import { useLandingBlocksStore } from '../../stores/use-landing-blocks-store';
import { useReorderLandingBlocks } from '../../hooks/use-reorder-landing-blocks';
import type { LandingBlock } from 'wle-core';

// ── Dumb View ─────────────────────────────────────────────────────────────────

type LandingBlockListViewProps = {
    blocks: LandingBlock[];
    isSavingOrder: boolean;
    reorderError: string | null;
    sensors: ReturnType<typeof useSensors>;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
};

function LandingBlockListView({
    blocks,
    isSavingOrder,
    reorderError,
    sensors,
    onDragStart,
    onDragEnd,
}: LandingBlockListViewProps) {
    if (blocks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <LayoutList className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-semibold text-muted-foreground">No blocks yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                    Create your first landing block to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {isSavingOrder && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    Saving order…
                </div>
            )}

            {reorderError && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{reorderError}</AlertDescription>
                </Alert>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {blocks.map((block) => (
                            <LandingBlockListItem key={block.id} block={block} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

// ── Smart Component ───────────────────────────────────────────────────────────

export function LandingBlockList() {
    const { blocks } = useLandingBlocksStore();
    const { commitReorder, beginDrag, isSaving, error } = useReorderLandingBlocks();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (_event: DragStartEvent) => {
        beginDrag(blocks);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const reordered = arrayMove(blocks, oldIndex, newIndex);

        commitReorder(reordered);
    };

    return (
        <LandingBlockListView
            blocks={blocks}
            isSavingOrder={isSaving}
            reorderError={error}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        />
    );
}