import type { Shipment } from "wle-core";

export type ShipmentsFilters = {
  status?: Shipment['status'] | 'all';
  search?: string;               // search by order uuid, tracking number, etc.
  fromDate?: string;              // ISO date
  toDate?: string;
};

export type FetchShipmentsParams = {
  page?: number;
  perPage?: number;
  sortBy?: keyof Shipment;
  sortOrder?: 'asc' | 'desc';
  filters?: ShipmentsFilters;
  with?: string[];                // relations to include, e.g. ['order', 'order.user']
};