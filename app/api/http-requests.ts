
import { serializeProductParams, type ProductQueryParams } from "~/lib/serialize-product-params";
import appFetch, { type PaginatedResponse } from "./app-fetch";
import type { OrdersQueryParams, OrdersResponse } from "~/types/orders";
import type {
    TransactionsQueryParams,
    TransactionsResponse,
    TransactionDetailResponse,
    AuditLogsResponse,
    WebhookLogsResponse,
} from "~/types/transactions";
import type { FetchShipmentsParams } from "~/types/shipments";
import type { FetchUsersParams } from "~/types/users";
import type { ClientCodeDetailResponse, ClientCodesQueryParams, ClientCodesResponse } from "~/types/client-codes";
import type { CouponDetailResponse, CouponsQueryParams, CouponsResponse } from "~/types/coupons";
import type { CreatePromotionData, PromotionDetailResponse, PromotionsQueryParams, PromotionsResponse, UpdatePromotionData } from "~/types/promotions";
import type { StoreShippingMethodData, StoreShippingRateData, UpdateShippingMethodData, UpdateShippingRateData } from "~/types/shipping-methods";
import type { VariantQueryParams } from "~/types/products";
import type { NotificationsQueryParams } from "~/components/notifications/types/notifications-query-params";
import type { ReorderLandingBlocksPayload, UpdateLandingBlockPayload, } from "~/routes/backoffice/landing-blocks/types/http-request-types";
import type { AppImage, AppNotification, Category, ClientCode, Coupon, LandingBlock, Order, Product, Promotion, RefundRequest, Setting, Shipment, ShippingMethod, ShippingRate, Transaction, User, UserStatus, Variant, VariantOption } from "wle-core";

// auth

export function getEmailInfo(email: string) {
    return appFetch.post<{ is_taken: boolean }>('/auth/email/info', { email });
}

export function logInWithEmail(data: { email: FormDataEntryValue, password: FormDataEntryValue }) {
    return appFetch.post<{
        auth: User,
        token: string,
    }>('/auth/login', { ...data, role: 'admin' });
}

export function registerUser(data: {
    email: FormDataEntryValue,
    password: FormDataEntryValue,
    password_confirmation: FormDataEntryValue,
    name?: string,
    role: string,
}) {
    return appFetch.post<{
        auth: User,
        token: string,
    }>('/auth/register', data)
}

export function getAuthUser() {
    return appFetch.get<{ user: User }>('/auth/user/get');
}

export function updateAuthUser(payload: {
    name?: string,
    email?: string,
    password?: string,
    password_confirmation?: string,
    current_password?: string,
    client_code_id?: number,
} | FormData) {
    return appFetch.post<{ user: User }>('/auth/user/update', payload);
}

export function sendEmailVerificationCode() {
    return appFetch.post<{ link_sent: boolean }>('/auth/email/send-validation-code', {});
}

export function attemptEmailVerification(code: FormDataEntryValue) {
    return appFetch.post<{ user: User }>('/auth/email/verify', { code });
}

export function sendPasswordResetLink(email: FormDataEntryValue) {
    return appFetch.post<{ link_sent: boolean }>('/auth/password/forgot', { email });
}

export function resetPassword(payload: FormData | { password: FormDataEntryValue, password_confirmation: FormDataEntryValue, token: FormDataEntryValue }) {
    return appFetch.post<{ user: User, token: string }>('/auth/password/reset', payload);
}

// End Auth

// Product
export function getProducts(params?: ProductQueryParams) {
    return appFetch.get<PaginatedResponse<Product>>('/product/all', {
        params: serializeProductParams({
            with: ['variants', 'images', 'category'],
            ...params,
        }),
    });
}

export function getProduct(slug: string) {
    return appFetch.get<{ product: Product }>(
        `/product/get/${slug}?with=cart_items.order,variant_groups.variant_options,variants.variant_options,variants.image,variants.promotions,images
        `);
}

export function createProduct(data: FormData) {
    return appFetch.post<{ product: Product }>('/product/create', data);
}

export function createFullProduct(data: FormData) {
    return appFetch.post<{ product: Product }>('/product/full-create', data);
}

export function createVariant(data: FormData) {
    return appFetch.post<{ variant: Variant }>('/variant/create', data);
}

export function createVariantOption(data: FormData) {
    return appFetch.post<{ "variant-option": VariantOption }>('/variant-option/create', data);
}

export function updateFullProduct(id: number, data: FormData) {
    return appFetch.post<{ product: Product }>(`/product/full-update/${id}`, data);
}

export function deleteProducts(ids: number[]) {
    return appFetch.delete(`/product/delete?product_ids=${ids.join(',')}`);
}

// End Product

export function getCouponFromCode(code: string) {
    return appFetch.get<{ coupon: Coupon }>(`/coupon/get/${code}`);
}

export function getOrder(uuid: string) {
    return appFetch.get<{ order: Order }>(`/order/get/${uuid}?with=transactions,shipments,user.avatar_image,cart_items,refund_requests`);
}


export function searchProducts(keywords: string) {
    return appFetch.get<{ products: Product[] }>(`/product/search/${keywords}?with=category,variants,images`);
}

export function deleteOrder(uuid: string) {
    return appFetch.delete<{ message: string }>(`/order/delete?order_uuids=${uuid}`);
}

// Categories
export function getCategories() {
    return appFetch.get<{ categories: Category[] }>('/category/all');
}

export function createCategory(data: FormData | { title: FormDataEntryValue | null, parent_id?: FormDataEntryValue | null }) {
    return appFetch.post<{ category: Category }>('/category/create', data);
}

export function updateCategory(id: FormDataEntryValue | null, data: FormData) {
    return appFetch.post<{ category: Category }>(`/category/update/${id}`, data);
}

export function deleteCategory(id: FormDataEntryValue | null) {
    return appFetch.delete<{ message: string }>(`/category/delete?category_ids=${id}`);
}

// End Categories

export function getClientCode(code: string) {
    return appFetch.get<{ client_code: ClientCode | null }>(`/client-code/get/${code}`);
}

// Order

export async function fetchOrders(params: OrdersQueryParams = {}) {
    const searchParams = new URLSearchParams();

    searchParams.append('with', 'user,transactions,shipments');

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    return appFetch.get<OrdersResponse>(`/order/all?${searchParams.toString()}`);
}

export async function bulkUpdateShipmentStatus(orderUuids: string[], status: string, data?: Record<string, any>) {
    return appFetch.post<{
        message: string,
        updated: number,
        errors: string[]
    }>('/shipment/bulk-update-shipment', { order_uuids: orderUuids, status, data });
}


// ── List & Detail ─────────────────────────────────────────────────────────────

export function getTransactions(params: TransactionsQueryParams = {}) {
    const searchParams = new URLSearchParams();
    searchParams.append("with", "user,order");

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "*") {
            searchParams.append(key, String(value));
        }
    });

    return appFetch.get<TransactionsResponse>(
        `/transactions?${searchParams.toString()}`
    );
}

export function getTransaction(uuid: string) {
    return appFetch.get<TransactionDetailResponse>(
        `/transactions/${uuid}?with=user,order.cart_items,audit_logs.performed_by_user,parent_transaction,child_transactions`
    );
}

// ── Actions ───────────────────────────────────────────────────────────────────

export function overrideTransactionStatus(
    uuid: string,
    data: { status: string; reason: string }
) {
    return appFetch.patch<{ transaction: Transaction }>(
        `/transactions/${uuid}/override-status`,
        data
    );
}

export function refundTransaction(
    uuid: string,
    data: { amount?: number; reason: string }
) {
    return appFetch.post<{ refund_transaction: Transaction }>(
        `/transactions/${uuid}/refund`,
        data
    );
}

export function resendTransactionNotification(uuid: string) {
    return appFetch.post<{ message: string }>(
        `/transactions/${uuid}/resend-notification`,
        {}
    );
}

export function bulkReviewTransactions(transaction_uuids: string[]) {
    return appFetch.post<{ message: string }>(
        `/transactions/bulk-review`,
        { transaction_uuids }
    );
}

export function exportTransactions(params: TransactionsQueryParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    // Returns a blob — handle with URL.createObjectURL in the component
    return appFetch.get<Blob>(`/transactions/export?${searchParams.toString()}`);
}

export function deleteTransactions(ids: number[], reason?: string) {
    return appFetch.delete<{ deleted: number }>(`/transactions`, {
        body: JSON.stringify({ transaction_ids: ids, reason }),
    });
}

// ── Dispute ───────────────────────────────────────────────────────────────────

export function openTransactionDispute(
    uuid: string,
    data: { reason: string }
) {
    return appFetch.post<{ transaction: Transaction }>(
        `/transactions/${uuid}/dispute`,
        data
    );
}

export function resolveTransactionDispute(
    uuid: string,
    data: { outcome: "RESOLVED" | "LOST"; reason: string }
) {
    return appFetch.patch<{ transaction: Transaction }>(
        `/transactions/${uuid}/dispute`,
        data
    );
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export function getTransactionAuditLogs(uuid: string, page = 1) {
    return appFetch.get<AuditLogsResponse>(
        `/transactions/${uuid}/audit-logs?page=${page}`
    );
}

export function getTransactionWebhookLogs(uuid: string, page = 1) {
    return appFetch.get<WebhookLogsResponse>(
        `/transactions/${uuid}/webhook-logs?page=${page}`
    );
}


/**
 * Fetch refund requests, optionally filtered by order UUID.
 * The backend index likely accepts ?order_uuid=...
 */
export function getRefundRequests(orderUuid?: string) {
    const params = new URLSearchParams();
    if (orderUuid) {
        params.append('order_uuid', orderUuid);
    }
    // optionally include user and order relations
    params.append('with', 'user,order');

    return appFetch.get<{ refund_requests: RefundRequest[] }>(
        `/refund-requests?${params.toString()}`
    );
}

export function approveRefundRequest(uuid: string) {
    return appFetch.post<{ refund_request: RefundRequest }>(
        `/refund-requests/${uuid}/approve`,
        {}
    );
}

export function rejectRefundRequest(uuid: string) {
    return appFetch.post<{ refund_request: RefundRequest }>(
        `/refund-requests/${uuid}/reject`,
        {}
    );
}

// Shipments

export function fetchShipments(params: FetchShipmentsParams = {}) {
    const searchParams = new URLSearchParams();

    // Pagination
    if (params.page) searchParams.set('page', String(params.page));
    if (params.perPage) searchParams.set('per_page', String(params.perPage));

    // Sorting
    if (params.sortBy) searchParams.set('sort_by', params.sortBy);
    if (params.sortOrder) searchParams.set('sort_order', params.sortOrder);

    // Filters
    if (params.filters?.status && params.filters.status !== 'all') {
        searchParams.set('status', params.filters.status);
    }
    if (params.filters?.search) {
        searchParams.set('search', params.filters.search);
    }
    if (params.filters?.fromDate) {
        searchParams.set('from_date', params.filters.fromDate);
    }
    if (params.filters?.toDate) {
        searchParams.set('to_date', params.filters.toDate);
    }

    // Include relations – backend should support ?with=order,user etc.
    if (params.with?.length) {
        searchParams.set('with', params.with.join(','));
    } else {
        // default: include order and its user
        searchParams.set('with', 'order,order.user');
    }

    return appFetch.get<PaginatedResponse<Shipment>>(`/shipment/all?${searchParams.toString()}`);
}

export function deleteShipment(id: number) {
    const params = new URLSearchParams();

    params.append('shipment_ids', id.toString());

    return appFetch.delete(`/shipment/delete?${params.toString()}`);
}

// Users
export function fetchUsers(params: FetchUsersParams = {}) {
    const searchParams = new URLSearchParams();

    // default: include avatar relation
    if (params.with?.length) {
        searchParams.set("with", params.with.join(","));
    } else {
        searchParams.set("with", "avatar_image,client_code");
    }

    // pagination
    if (params.page) searchParams.set("page", String(params.page));
    if (params.per_page) searchParams.set("per_page", String(params.per_page));

    // filtering
    if (params.search) searchParams.set("search", params.search);
    if (params.role && params.role !== "all") searchParams.set("role", params.role);

    // sorting
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);

    if (params.statusIn)
        params.statusIn.forEach(status => {
            searchParams.append("status_in[]", status);
        });

    return appFetch.get<PaginatedResponse<User>>(
        `/user/all?${searchParams.toString()}`
    );
}

export function showUser(userId: number) {
    const params = new URLSearchParams();

    params.append('with', 'avatar_image,client_code,cart_items,addresses,orders,transactions,refund_requests,reviewed_refund_requests,performed_transaction_audit_logs,reviewed_transactions,statuses.set_by_user,set_statuses.user')

    return appFetch.get<{ user: User }>(`/user/get/${userId}?${params.toString()}`)
}

export function updateUserStatus(userId: number, status: Partial<UserStatus>) {
    return appFetch.post(`/user/${userId}/status`, status);
}

// Users
export function updateUser(userId: number, data: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    client_code_id?: number | null;
    password?: string | null;
    password_confirmation?: string | null;
}) {
    return appFetch.post<{ user: User }>(`/user/update/${userId}`, data);
}

// Client Codes
export function fetchClientCodes(params: ClientCodesQueryParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.with?.length) {
        searchParams.set("with", params.with.join(","));
    } else {
        searchParams.set("with", "users");
    }

    if (params.page) searchParams.set("page", String(params.page));
    if (params.per_page) searchParams.set("per_page", String(params.per_page));
    if (params.search) searchParams.set("search", params.search);
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);
    if (params.is_active !== undefined && params.is_active !== "all") {
        searchParams.set("is_active", params.is_active ? "1" : "0");
    }

    return appFetch.get<ClientCodesResponse>(
        `/client-code/all?${searchParams.toString()}`
    );
}

export function showClientCode(id: number) {
    return appFetch.get<ClientCodeDetailResponse>(
        `/client-code/get-by-id/${id}?with=users.avatar_image`
    );
}

export function createClientCode(data: {
    code: string;
    is_active?: boolean;
    max_uses?: number | null;
}) {
    if (!data.max_uses)
        delete data.max_uses;

    return appFetch.post<{ client_code: ClientCode }>("/client-code/create", data);
}

export function updateClientCode(
    id: number,
    data: {
        code?: string;
        is_active?: boolean;
        max_uses?: number | null;
    }
) {
    if (!data.max_uses)
        delete data.max_uses;

    return appFetch.put<{ client_code: ClientCode }>(
        `/client-code/update/${id}`,
        data
    );
}

export function deleteClientCode(id: number) {
    return appFetch.delete<{ message: string }>(
        `/client-code/delete?client_code_ids=${id}`
    );
}

export function bulkDeleteClientCodes(ids: number[]) {
    return appFetch.delete<{ message: string; deleted: number }>(
        `/client-code/delete?client_code_ids=${ids.join(",")}`
    );
}

export function detachUserFromClientCode(codeId: number, userId: number) {
    return appFetch.post<{ message: string }>(
        `/client-code/${codeId}/detach-user`,
        { user_id: userId }
    );
}


// Coupons

export function fetchCoupons(params: CouponsQueryParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.with?.length) {
        searchParams.set("with", params.with.join(","));
    }

    if (params.page) searchParams.set("page", String(params.page));
    if (params.per_page) searchParams.set("per_page", String(params.per_page));
    if (params.search) searchParams.set("search", params.search);
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);
    if (params.is_active !== undefined && params.is_active !== "all") {
        searchParams.set("is_active", params.is_active ? "1" : "0");
    }
    if (params.type && params.type !== "all") {
        searchParams.set("type", params.type);
    }

    return appFetch.get<CouponsResponse>(
        `/coupon/all?${searchParams.toString()}`
    );
}

export function showCoupon(id: number) {
    // Loads the coupon with recent orders that used it
    return appFetch.get<CouponDetailResponse>(
        `/coupon/get-by-id/${id}?with=orders.user`
    );
}

export function createCoupon(data: {
    code: string;
    type: "FIXED_AMOUNT" | "PERCENTAGE";
    discount: number;
    min_order_value: number;
    max_uses: number;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}) {
    return appFetch.post<{ coupon: Coupon }>("/coupon/create", data);
}

export function updateCoupon(
    id: number,
    data: Partial<{
        code: string;
        type: "FIXED_AMOUNT" | "PERCENTAGE";
        discount: number;
        min_order_value: number;
        max_uses: number;
        start_date: string;
        end_date: string;
        is_active: boolean;
    }>
) {
    return appFetch.put<{ coupon: Coupon }>(`/coupon/update/${id}`, data);
}

export function deleteCoupon(id: number) {
    return appFetch.delete<{ message: string }>(
        `/coupon/delete?coupon_ids=${id}`
    );
}

export function bulkDeleteCoupons(ids: number[]) {
    return appFetch.delete<{ message: string; deleted: number }>(
        `/coupon/delete?coupon_ids=${ids.join(",")}`
    );
}

export function toggleCouponActive(id: number, is_active: boolean) {
    return appFetch.put<{ coupon: Coupon }>(`/coupon/update/${id}`, {
        is_active,
    });
}

// Promotions

export function fetchPromotions(params: PromotionsQueryParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.with?.length) {
        searchParams.set("with", params.with.join(","));
    }

    if (params.page) searchParams.set("page", String(params.page));
    if (params.per_page) searchParams.set("per_page", String(params.per_page));
    if (params.search) searchParams.set("search", params.search);
    if (params.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params.sort_order) searchParams.set("sort_order", params.sort_order);
    if (params.is_active !== undefined && params.is_active !== "all") {
        searchParams.set("is_active", params.is_active ? "1" : "0");
    }
    if (params.type && params.type !== "all") {
        searchParams.set("type", params.type);
    }
    if (params.applies_to && params.applies_to !== "all") {
        searchParams.set("applies_to", params.applies_to);
    }

    return appFetch.get<PromotionsResponse>(
        `/promotion/all?${searchParams.toString()}`
    );
}

export function showPromotion(id: number) {
    // Load with variants and their products so we can display affected SKUs
    return appFetch.get<PromotionDetailResponse>(
        `/promotion/get/${id}?with=variants.product,variants.image,variants.variant_options.variant_group`
    );
}

export function createPromotion(data: CreatePromotionData) {
    return appFetch.post<{ promotion: Promotion }>("/promotion/create", data);
}

export function updatePromotion(id: number, data: UpdatePromotionData) {
    return appFetch.put<{ promotion: Promotion }>(
        `/promotion/update/${id}`,
        data
    );
}

export function deletePromotion(id: number) {
    return appFetch.delete<{ message: string }>(
        `/promotion/delete?promotion_ids=${id}`
    );
}

export function bulkDeletePromotions(ids: number[]) {
    return appFetch.delete<{ message: string; deleted: number }>(
        `/promotion/delete?promotion_ids=${ids.join(",")}`
    );
}

export function togglePromotionActive(id: number, is_active: boolean) {
    return appFetch.put<{ promotion: Promotion }>(
        `/promotion/update/${id}`,
        { is_active }
    );
}

// Attach / detach a promotion from a specific variant
export function attachPromotionToVariant(
    promotionId: number,
    variantId: number
) {
    return appFetch.put<{ message: string }>(
        `/promotion/${promotionId}/attach-variant`,
        { variant_id: variantId }
    );
}

export function detachPromotionFromVariant(
    promotionId: number,
    variantId: number
) {
    return appFetch.put<{ message: string }>(
        `/promotion/${promotionId}/detach-variant`,
        { variant_id: variantId }
    );
}

/**
 * Bulk-attach multiple variant IDs to a single promotion in one request.
 * Returns per-variant results so the UI can surface partial failures.
 */
export function bulkAttachPromotionVariants(
    promotionId: number,
    variantIds: number[]
) {
    return appFetch.put<{
        message: string;
        attached: number[];   // successfully attached variant IDs
        skipped: number[];    // already attached (no-ops)
        failed: number[];     // variant IDs that errored server-side
    }>(`/promotion/${promotionId}/bulk-attach-variants`, {
        variant_ids: variantIds,
    });
}


// ── Shipping Methods ─────────────────────────────────────────────────────────

export function fetchShippingMethods() {
    return appFetch.get<{ data: ShippingMethod[] }>('/shipping-methods');
}

export function showShippingMethod(id: number) {
    return appFetch.get<{ data: ShippingMethod }>(`/shipping-methods/${id}`);
}

export function createShippingMethod(data: StoreShippingMethodData) {
    return appFetch.post<ShippingMethod>('/shipping-methods', data);
}

export function updateShippingMethod(id: number, data: UpdateShippingMethodData) {
    return appFetch.put<ShippingMethod>(`/shipping-methods/${id}`, data);
}

export function deleteShippingMethod(id: number) {
    return appFetch.delete<{ message: string }>(`/shipping-methods/${id}`);
}

// ── Rates ─────────────────────────────────────────────────────────────────────

export function fetchShippingRates(methodId: number) {
    return appFetch.get<{ data: ShippingRate[] }>(`/shipping-methods/${methodId}/rates`);
}

export function showShippingRate(methodId: number, rateId: number) {
    return appFetch.get<{ data: ShippingRate }>(`/shipping-methods/${methodId}/rates/${rateId}`);
}

export function createShippingRate(methodId: number, data: StoreShippingRateData) {
    return appFetch.post<{ data: ShippingRate }>(`/shipping-methods/${methodId}/rates`, data);
}

export function updateShippingRate(methodId: number, rateId: number, data: UpdateShippingRateData) {
    return appFetch.put<{ data: ShippingRate }>(`/shipping-methods/${methodId}/rates/${rateId}`, data);
}

export function deleteShippingRate(methodId: number, rateId: number) {
    return appFetch.delete<{ message: string }>(`/shipping-methods/${methodId}/rates/${rateId}`);
}

export function getSettings() {
    return appFetch.get<Setting[]>('/settings');
}

export function updateSetting(setting: Setting) {
    return appFetch.put<Setting>(`/settings/${setting.key}`, setting);
}

export function fetchKpi() {
    return appFetch.get<{
        total_revenue: number,
        total_orders: number,
        average_order_value: number,
        pending_refunds_count: number
    }>('/dashboard/kpi');
}

export function fetchSalesTrend() {
    return appFetch.get<{ labels: string[], data: number[] }>('/dashboard/sales-trend');
}

export function fetchVariants(params: VariantQueryParams = {}) {
    const searchParams = new URLSearchParams();
    let relations: string[] = ["product", "image", "variant_options.variant_group"];

    // Default relations
    if (params.with?.length) {
        relations = params.with;
    }

    relations.forEach((relation) => {
        searchParams.append('with[]', relation);
    });

    // Pagination
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    // Sorting
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_order) searchParams.set('sort_order', params.sort_order);

    // Filters
    if (params.product_id) searchParams.set('product_id', String(params.product_id));
    if (params.sku) searchParams.set('sku', params.sku);
    if (params.min_price !== undefined) searchParams.set('min_price', String(params.min_price));
    if (params.max_price !== undefined) searchParams.set('max_price', String(params.max_price));
    if (params.min_stock !== undefined) searchParams.set('min_stock', String(params.min_stock));
    if (params.max_stock !== undefined) searchParams.set('max_stock', String(params.max_stock));
    if (params.low_stock !== undefined) searchParams.set('low_stock', params.low_stock ? '1' : '0');
    if (params.search) searchParams.set('search', params.search);

    return appFetch.get<PaginatedResponse<Variant>>(`/variant/all?${searchParams.toString()}`);
}

export function getNotifications(params: NotificationsQueryParams) {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));

    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    return appFetch.get<{
        notifications: PaginatedResponse<AppNotification>,
        unread_count: number,
    }>('/notifications');
}

export function getUnreadNotifications(params: NotificationsQueryParams) {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));

    if (params.per_page) searchParams.set('per_page', String(params.per_page));

    return appFetch.get<{
        notifications: PaginatedResponse<AppNotification>,
        count: number,
    }>('/notifications/unread');
}

export function clearReadNotifications() {
    return appFetch.delete<{ message: string }>('/notifications/clear-read');
}

export function markAllNotificationsAsRead() {
    return appFetch.post<{
        message: string,
    }>('/notifications/mark-all-read', {});
}

export function removeNotification(id: string) {
    return appFetch.delete<{ message: string }>(`/notifications/${id}`);
}

export function markNotificationAsRead(id: string) {
    return appFetch.patch<{
        message: string,
        notification: AppNotification
    }>(`/notifications/${id}/read`, {});
}

export function logout(options?: RequestInit) {
    return appFetch.get<{ message: string }>('/auth/logout', options)
}

// ============================================================================
// Landing Blocks
// ============================================================================


/**
 * Admin: get all landing blocks (optional ?active_only=true).
 * Requires admin authentication.
 */
export function getLandingBlocks(activeOnly?: boolean) {
    const params = activeOnly ? '?active_only=true' : '';
    return appFetch.get<LandingBlock[]>(`/landing-blocks${params}`);
}

/**
 * Admin: get a single landing block by ID, with its relations loaded.
 */
export function getLandingBlock(id: number) {
    return appFetch.get<LandingBlock>(`/landing-blocks/${id}`);
}

export function createLandingBlock(payload: FormData) {
    return appFetch.post<LandingBlock>('/landing-blocks', payload);
}

export function updateLandingBlock(id: number, payload: FormData | UpdateLandingBlockPayload) {
    return appFetch.post<LandingBlock>(`/landing-blocks/${id}`, payload);
}

/**
 * Admin: delete a landing block.
 */
export function deleteLandingBlock(id: number) {
    return appFetch.delete<null>(`/landing-blocks/${id}`);
}

/**
 * Admin: reorder landing blocks (drag & drop).
 * Expected payload: { blocks: [{ id: 1, display_order: 0 }, ...] }
 */
export function reorderLandingBlocks(payload: ReorderLandingBlocksPayload) {
    return appFetch.put<{ message: string }>('/landing-blocks/reorder', payload);
}

export function storeImage(payload: { image: File, path: string }) {
    const formData = new FormData();

    for (const key in payload)
        formData.set(key, payload[key as keyof typeof payload]);

    return appFetch.post<{ image: AppImage }>('/images', formData);
}

export function deleteImage(id: number) {
    return appFetch.delete<{ deleted: boolean | null }>(`/images/${id}`);
}