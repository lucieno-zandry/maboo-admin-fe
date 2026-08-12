import type { CollectionContentItem, LandingBlock } from "wle-core";

export type LandingBlockFormMode = 'create' | 'edit';

export type LandingBlockFormStep = 'type' | 'content' | 'relation';

export type LandingBlockFormData<Content = Record<string, any>> = {
    block_type: LandingBlock['block_type'] | '';
    title: string;
    subtitle: string;
    content: Content;
    landing_able_type: string;
    landing_able_id: number | '';
    image: File | null;               // changed from image_id
    remove_image: boolean;            // new flag (only meaningful in edit mode)
    display_order: number;
    is_active: boolean;
};

export type CollectionItem = CollectionContentItem & {
    // For UI display
    imageUrl?: string | null;
    image_file?: File | null;
}