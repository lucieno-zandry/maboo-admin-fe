import type { ClientCode } from "wle-core";

export type ClientCodesQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean | "all";
    sort_by?: "created_at" | "code" | "uses_count";
    sort_order?: "asc" | "desc";
    with?: string[];
};

export type ClientCodesResponse = {
    data: ClientCode[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};

export type ClientCodeDetailResponse = {
    client_code: ClientCode; // with users relation loaded
};
