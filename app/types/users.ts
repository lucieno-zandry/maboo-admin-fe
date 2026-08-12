// types/users.ts

import type { User, UserStatus } from "wle-core";

export type FetchUsersParams = {
    page?: number;
    per_page?: number;
    search?: string;
    role?: User["role"] | "all";
    sort_by?: string;
    sort_order?: "asc" | "desc";
    with?: string[]; // e.g. ['avatar_image', 'client_code'],
    statusIn?: UserStatus['status'][];
};