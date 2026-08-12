import type { Coupon } from "wle-core";

export type CouponsQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean | "all";
  type?: "FIXED_AMOUNT" | "PERCENTAGE" | "all";
  sort_by?: "created_at" | "code" | "uses_count" | "discount" | "end_date";
  sort_order?: "asc" | "desc";
  with?: string[];
};

export type CouponsResponse = {
  data: Coupon[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export type CouponDetailResponse = {
  coupon: Coupon; // with orders relation loaded
};