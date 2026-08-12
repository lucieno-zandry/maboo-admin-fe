import type { Order } from "wle-core";
import type { PaginatedResponse } from "~/api/app-fetch";

export type OrdersResponse = PaginatedResponse<Order> 

// types/orders.ts
export interface OrdersQueryParams {
  page?: number;
  per_page?: number;
  sort?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
  shipment_status?: string;
  total_min?: number;   // new
  total_max?: number;   // new
}