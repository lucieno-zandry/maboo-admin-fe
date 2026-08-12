import type { AppImage } from "wle-core";
import type { DraftImage } from "~/types/drafts";

export function isDraftImageExisting(img: DraftImage): img is AppImage {
    return "id" in img && "url" in img;
}

export function isDraftImageNew(img: DraftImage): img is File {
    return img instanceof File;
}