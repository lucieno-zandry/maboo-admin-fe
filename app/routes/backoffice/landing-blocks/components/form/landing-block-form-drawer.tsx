import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS } from '../../helpers/data';
import { StepIndicator, type Step } from './step-indicator';
import { BlockTypeStep } from './block-type-step';
import { BlockMetaFields } from './block-meta-fields';
import { RelationFields } from './relation-fields';
import { FormErrorBanner } from './form-error-banner';
import { useLandingBlockFormStore } from '../../stores/use-landing-block-form-store';
import { useSaveLandingBlock } from '../../hooks/use-save-landing-block';
import type { LandingBlock } from 'wle-core';

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
    { id: 'type', label: 'Type' },
    { id: 'content', label: 'Content' },
    { id: 'relation', label: 'Relation' },
];

type StepId = 'type' | 'content' | 'relation';

// ── Dumb View ─────────────────────────────────────────────────────────────────

type LandingBlockFormDrawerViewProps = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    currentStep: StepId;
    completedSteps: StepId[];
    isSaving: boolean;
    errors: Record<string, string>;
    blockType: LandingBlock['block_type'] | '';
    onClose: () => void;
    onNext: () => void;
    onBack: () => void;
    onSubmit: () => void;
};

function LandingBlockFormDrawerView({
    isOpen,
    mode,
    currentStep,
    completedSteps,
    isSaving,
    errors,
    blockType,
    onClose,
    onNext,
    onBack,
    onSubmit,
}: LandingBlockFormDrawerViewProps) {
    const isLastStep = currentStep === 'relation';
    const isFirstStep = currentStep === 'type';
    const canProceedFromType = blockType !== '';

    const titleIcon = blockType ? BLOCK_TYPE_ICONS[blockType] : null;
    const titleLabel = blockType ? BLOCK_TYPE_LABELS[blockType] : null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[520px] flex flex-col gap-0 p-0 overflow-hidden"
            >
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/20 shrink-0">
                    <div className="flex items-center gap-2">
                        {titleIcon && <span className="text-lg">{titleIcon}</span>}
                        <SheetTitle className="text-base">
                            {mode === 'create'
                                ? titleLabel
                                    ? `New ${titleLabel}`
                                    : 'New Landing Block'
                                : `Edit ${titleLabel ?? 'Block'}`}
                        </SheetTitle>
                    </div>
                    <SheetDescription className="text-xs sr-only">
                        {mode === 'create' ? 'Create a new landing block' : 'Edit existing landing block'}
                    </SheetDescription>

                    <div className="pt-3">
                        <StepIndicator
                            steps={STEPS}
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                        />
                    </div>
                </SheetHeader>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <FormErrorBanner errors={errors} />

                    {currentStep === 'type' && <BlockTypeStep />}
                    {currentStep === 'content' && <BlockMetaFields errors={errors} />}
                    {currentStep === 'relation' && <RelationFields errors={errors} />}
                </div>

                {/* Footer */}
                <SheetFooter className="px-6 py-4 border-t bg-muted/10 shrink-0 flex flex-row justify-between gap-2 sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={isFirstStep ? onClose : onBack}
                        disabled={isSaving}
                        className="gap-1.5"
                    >
                        {!isFirstStep && <ArrowLeft className="h-3.5 w-3.5" />}
                        {isFirstStep ? 'Cancel' : 'Back'}
                    </Button>

                    {isLastStep ? (
                        <Button
                            onClick={onSubmit}
                            disabled={isSaving}
                            className="gap-1.5"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" />
                                    {mode === 'create' ? 'Create block' : 'Save changes'}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={onNext}
                            disabled={currentStep === 'type' && !canProceedFromType}
                            className="gap-1.5"
                        >
                            Next
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// ── Smart Component ───────────────────────────────────────────────────────────

export function LandingBlockFormDrawer() {
    const [currentStep, setCurrentStep] = useState<StepId>('type');
    const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);

    const { isOpen, mode, formData, close } = useLandingBlockFormStore();
    const { save, isSaving, errors } = useSaveLandingBlock();

    const handleClose = () => {
        close();
        setCurrentStep('type');
        setCompletedSteps([]);
    };

    const handleNext = () => {
        if (currentStep === 'type') {
            setCompletedSteps((prev) => [...new Set([...prev, 'type'])] as StepId[]);
            setCurrentStep('content');
        } else if (currentStep === 'content') {
            setCompletedSteps((prev) => [...new Set([...prev, 'content'])] as StepId[]);
            setCurrentStep('relation');
        }
    };

    const handleBack = () => {
        if (currentStep === 'content') setCurrentStep('type');
        else if (currentStep === 'relation') setCurrentStep('content');
    };

    const handleSubmit = () => {
        save(formData);
    };

    // When editing, start at content step (type is already set)
    if (isOpen && mode === 'edit' && currentStep === 'type' && completedSteps.length === 0) {
        setCurrentStep('content');
        setCompletedSteps(['type']);
    }

    return (
        <LandingBlockFormDrawerView
            isOpen={isOpen}
            mode={mode}
            currentStep={currentStep}
            completedSteps={completedSteps}
            isSaving={isSaving}
            errors={errors}
            blockType={formData.block_type}
            onClose={handleClose}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
        />
    );
}