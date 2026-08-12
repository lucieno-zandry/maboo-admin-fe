import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Eye, EyeOff, Layers } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS } from '../../helpers/data';
import { getLandingAbleLabel, getLandingAbleThumbnail, getLandingAbleType, getLandingAbleMeta } from '../../helpers/landing-able-guards';
import { useLandingBlockFormStore } from '../../stores/use-landing-block-form-store';
import { useLandingBlockDeleteDialogStore } from '../../stores/use-landing-block-delete-dialog-store';
import { updateLandingBlock } from '~/api/http-requests';
import { useLandingBlocksStore } from '../../stores/use-landing-blocks-store';
import { useState } from 'react';
import type { LandingBlock } from 'wle-core';

// ── Types ─────────────────────────────────────────────────────────────────────

type LandingBlockListItemProps = {
    block: LandingBlock;
};

// ── Dumb View ─────────────────────────────────────────────────────────────────

type LandingBlockListItemViewProps = {
    block: LandingBlock;
    isDragging: boolean;
    isTogglingActive: boolean;
    dragListeners: ReturnType<typeof useSortable>['listeners'];
    dragAttributes: ReturnType<typeof useSortable>['attributes'];
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: (checked: boolean) => void;
};

function LandingBlockListItemView({
    block,
    isDragging,
    isTogglingActive,
    dragListeners,
    dragAttributes,
    setNodeRef,
    style,
    onEdit,
    onDelete,
    onToggleActive,
}: LandingBlockListItemViewProps) {
    const thumbnail = getLandingAbleThumbnail(block.landing_able ?? null);
    const ableLabel = getLandingAbleLabel(block.landing_able ?? null);
    const ableType = getLandingAbleType(block.landing_able ?? null);
    const ableMeta = getLandingAbleMeta(block.landing_able ?? null);
    const typeIcon = BLOCK_TYPE_ICONS[block.block_type];
    const typeLabel = BLOCK_TYPE_LABELS[block.block_type];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative flex items-stretch gap-0 rounded-xl border bg-card transition-all duration-200',
                'hover:shadow-md hover:border-primary/30',
                isDragging && 'opacity-50 shadow-2xl scale-[1.02] z-50 border-primary/50',
                !block.is_active && 'opacity-60'
            )}
        >
            {/* Drag Handle */}
            <div
                {...dragListeners}
                {...dragAttributes}
                className={cn(
                    'flex items-center justify-center w-10 rounded-l-xl cursor-grab active:cursor-grabbing',
                    'text-muted-foreground/40 hover:text-muted-foreground',
                    'hover:bg-muted/50 transition-colors border-r border-dashed border-border/50'
                )}
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Block type icon + thumbnail */}
            <div className="flex items-center justify-center w-16 shrink-0 bg-muted/30 border-r border-border/40">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg"
                    />
                ) : (
                    <span className="text-2xl select-none">{typeIcon}</span>
                )}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 font-mono">
                        {typeLabel}
                    </span>
                    {!block.is_active && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            Inactive
                        </Badge>
                    )}
                </div>

                <p className="font-semibold text-sm truncate leading-snug">
                    {block.title || <span className="text-muted-foreground italic font-normal">Untitled</span>}
                </p>

                {block.subtitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{block.subtitle}</p>
                )}

                {/* Relation info */}
                {block.landing_able && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Layers className="h-3 w-3 text-primary/60 shrink-0" />
                        <span className="text-[11px] text-primary/70 font-medium">{ableType}</span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground truncate">{ableLabel}</span>
                        {ableMeta && (
                            <>
                                <span className="text-[11px] text-muted-foreground/50 hidden sm:block">·</span>
                                <span className="text-[11px] text-muted-foreground/60 hidden sm:block">{ableMeta}</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Order badge */}
            <div className="hidden sm:flex items-center justify-center w-12 shrink-0 text-center">
                <span className="text-xs font-mono text-muted-foreground/60 bg-muted/40 rounded-md px-2 py-1">
                    #{block.display_order + 1}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 px-3 border-l border-border/40 shrink-0">
                {/* Active Toggle */}
                <div className="flex items-center gap-1.5 pr-3 border-r border-border/40 mr-1">
                    {block.is_active
                        ? <Eye className="h-3 w-3 text-muted-foreground" />
                        : <EyeOff className="h-3 w-3 text-muted-foreground" />
                    }
                    <Switch
                        checked={block.is_active}
                        onCheckedChange={onToggleActive}
                        disabled={isTogglingActive}
                        className="scale-75"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onEdit}
                >
                    <Pencil className="h-3.5 w-3.5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onDelete}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

// ── Smart Component ───────────────────────────────────────────────────────────

export function LandingBlockListItem({ block }: LandingBlockListItemProps) {
    const [isTogglingActive, setIsTogglingActive] = useState(false);
    const { openEdit } = useLandingBlockFormStore();
    const { open: openDelete } = useLandingBlockDeleteDialogStore();
    const { updateBlock } = useLandingBlocksStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleToggleActive = async (checked: boolean) => {
        setIsTogglingActive(true);
        try {
            const updated = (await updateLandingBlock(block.id, { is_active: checked })).data!;
            updateBlock(block.id, updated);
        } catch {
            // silent – keep original state
        } finally {
            setIsTogglingActive(false);
        }
    };

    return (
        <LandingBlockListItemView
            block={block}
            isDragging={isDragging}
            isTogglingActive={isTogglingActive}
            dragListeners={listeners}
            dragAttributes={attributes}
            setNodeRef={setNodeRef}
            style={style}
            onEdit={() => openEdit(block)}
            onDelete={() => openDelete(block.id, block.block_type)}
            onToggleActive={handleToggleActive}
        />
    );
}