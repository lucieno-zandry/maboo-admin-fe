import type { LandingBlock } from "wle-core";

export type StoreLandingBlockPayload = {
    block_type: LandingBlock['block_type'];
    title?: string | null;
    subtitle?: string | null;
    content?: Record<string, any> | null;
    landing_able_type?: string | null;
    landing_able_id?: number | null;
    image?: File;                   // file upload instead of image_id
    display_order?: number;
    is_active?: boolean;
};

export type UpdateLandingBlockPayload = Partial<StoreLandingBlockPayload> & {
    remove_image?: boolean;         // explicitly delete the associated image
};

export type ReorderLandingBlocksPayload = {
    blocks: Array<{ id: number; display_order: number }>;
};
