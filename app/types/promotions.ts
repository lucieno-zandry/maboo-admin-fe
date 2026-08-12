import type { Promotion } from "wle-core";

export type PromotionsQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean | "all";
  type?: "PERCENTAGE" | "FIXED_AMOUNT" | "all";
  applies_to?: Promotion["applies_to"] | "all";
  sort_by?: "created_at" | "name" | "priority" | "discount" | "end_date";
  sort_order?: "asc" | "desc";
  with?: string[];
};

export type PromotionsResponse = {
  data: Promotion[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type PromotionDetailResponse = {
  promotion: Promotion; // with variants.product relation loaded
};

export type CreatePromotionData = {
  name: string;
  discount: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  start_date: string;
  end_date: string;
  is_active?: boolean;
  badge?: string | null;
  applies_to: "all" | "client_code_only" | "regular_only";
  stackable: boolean;
  priority: number;
  apply_order?: "percentage_first" | "fixed_first" | null;
  max_discount?: number | null;
};

export type UpdatePromotionData = Partial<CreatePromotionData>;
