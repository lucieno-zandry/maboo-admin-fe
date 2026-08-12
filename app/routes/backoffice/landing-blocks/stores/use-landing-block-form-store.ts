import { create } from 'zustand';
import type { LandingBlockFormData } from '../types/landing-block-form-types';
import type { LandingBlock } from 'wle-core';

type LandingBlockFormState = {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editingBlock: LandingBlock | null;
    formData: LandingBlockFormData;

    openCreate: () => void;
    openEdit: (block: LandingBlock) => void;
    close: () => void;
    setFormData: (data: Partial<LandingBlockFormData>) => void;
    resetForm: () => void;
};

const defaultFormData: LandingBlockFormData = {
    block_type: '',
    title: '',
    subtitle: '',
    content: {},
    landing_able_type: '',
    landing_able_id: '',
    image: null,
    remove_image: false,
    display_order: 0,
    is_active: true,
};

export const useLandingBlockFormStore = create<LandingBlockFormState>((set) => ({
    isOpen: false,
    mode: 'create',
    editingBlock: null,
    formData: { ...defaultFormData },

    openCreate: () =>
        set({
            isOpen: true,
            mode: 'create',
            editingBlock: null,
            formData: { ...defaultFormData },
        }),

    openEdit: (block) =>
        set({
            isOpen: true,
            mode: 'edit',
            editingBlock: block,
            formData: {
                block_type: block.block_type,
                title: block.title ?? '',
                subtitle: block.subtitle ?? '',
                content: block.content ?? {},
                landing_able_type: block.landing_able_type ?? '',
                landing_able_id: block.landing_able_id ?? '',
                image: null,               // we don't preload the file, just allow new upload
                remove_image: false,
                display_order: block.display_order,
                is_active: block.is_active,
            },
        }),

    close: () => set({ isOpen: false }),

    setFormData: (data) =>
        set((state) => ({
            formData: { ...state.formData, ...data },
        })),

    resetForm: () =>
        set({
            formData: { ...defaultFormData },
            editingBlock: null,
        }),
}));