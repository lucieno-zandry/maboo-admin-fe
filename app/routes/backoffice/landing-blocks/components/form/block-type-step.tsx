import { cn } from '~/lib/utils';
import {
    BLOCK_TYPE_LABELS,
    BLOCK_TYPE_DESCRIPTIONS,
    BLOCK_TYPE_ICONS,
} from '../../helpers/data';
import { useLandingBlockFormStore } from '../../stores/use-landing-block-form-store';
import type { LandingBlock } from 'wle-core';

const BLOCK_TYPES = Object.keys(BLOCK_TYPE_LABELS) as LandingBlock['block_type'][];

// ── Dumb View ─────────────────────────────────────────────────────────────────

type BlockTypeStepViewProps = {
    selectedType: LandingBlock['block_type'] | '';
    onSelect: (type: LandingBlock['block_type']) => void;
};

export function BlockTypeStepView({ selectedType, onSelect }: BlockTypeStepViewProps) {
    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-sm font-semibold mb-0.5">Choose block type</h3>
                <p className="text-xs text-muted-foreground">Select the layout that best fits your content.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BLOCK_TYPES.map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onSelect(type)}
                        className={cn(
                            'flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all duration-150',
                            'hover:bg-muted/40 hover:border-primary/40',
                            selectedType === type
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-transparent bg-muted/20'
                        )}
                    >
                        <span className="text-xl shrink-0 mt-0.5">{BLOCK_TYPE_ICONS[type]}</span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight">{BLOCK_TYPE_LABELS[type]}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                {BLOCK_TYPE_DESCRIPTIONS[type]}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Smart Component ───────────────────────────────────────────────────────────

export function BlockTypeStep() {
    const { formData, setFormData } = useLandingBlockFormStore();

    return (
        <BlockTypeStepView
            selectedType={formData.block_type}
            onSelect={(type) => setFormData({ block_type: type })}
        />
    );
}