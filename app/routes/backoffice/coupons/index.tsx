// routes/backoffice/coupons/index.tsx
import { useEffect, useState } from "react";
import { CouponListPanel } from "~/components/coupons/coupon-list-panel";
import { CouponDetailPanel } from "~/components/coupons/coupon-detail-panel";
import { CouponFormDialog } from "~/components/coupons/coupon-form-dialog";
import {
  CouponDeleteDialog,
  CouponBulkDeleteDialog,
} from "~/components/coupons/coupon-delete-dialog";
import { toast } from "sonner";
import { useCouponsStore } from "~/hooks/use-coupon-store";
import useDebounce from "~/hooks/use-debounce";
import type { Coupon } from "wle-core";

// ─────────────────────────────────────────────────────────────────────────────
// Smart component
// ─────────────────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const {
    coupons,
    meta,
    listLoading,
    selectedCouponId,
    selectedCoupon,
    detailLoading,
    selectedIds,
    mutating,
    params,
    loadCoupons,
    selectCoupon,
    setParams,
    toggleSelect,
    selectAll,
    clearSelection,
    createCoupon,
    updateCoupon,
    toggleActive,
    deleteCoupon,
    bulkDelete,
  } = useCouponsStore();

  // ── Local UI state ──────────────────────────────────────────────────────

  const [search, setSearch] = useState(params.search ?? "");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all");
  const [filterType, setFilterType] = useState<
    "all" | "PERCENTAGE" | "FIXED_AMOUNT"
  >("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 350);

  // ── Initial load ────────────────────────────────────────────────────────

  useEffect(() => {
    loadCoupons();
  }, []);

  // ── Reload on search / filter changes ───────────────────────────────────

  useEffect(() => {
    // Map status filter to API params
    const isActive =
      filterStatus === "all"
        ? "all"
        : filterStatus === "active"
        ? true
        : filterStatus === "inactive"
        ? false
        : "all"; // "expired" is client-derived, we load all and filter visually
        // OR you could pass an "expired" param if your backend supports it

    const newParams = {
      search: debouncedSearch || undefined,
      is_active: isActive as boolean | "all",
      type: filterType === "all" ? undefined : filterType,
      page: 1,
    };

    setParams(newParams);
    loadCoupons(newParams);
  }, [debouncedSearch, filterStatus, filterType]);

  // ── Pagination ──────────────────────────────────────────────────────────

  const handlePageChange = (page: number) => {
    setParams({ page });
    loadCoupons({ page });
  };

  // ── CRUD handlers ───────────────────────────────────────────────────────

  const handleCreate = async (data: Parameters<typeof createCoupon>[0]) => {
    const result = await createCoupon(data);
    if (result) {
      toast.success(`Coupon "${result.code}" created successfully`);
      setCreateOpen(false);
    } else {
      toast.error("Failed to create coupon");
    }
  };

  const handleEdit = async (data: Parameters<typeof createCoupon>[0]) => {
    if (!editTarget) return;
    const result = await updateCoupon(editTarget.id, data);
    if (result) {
      toast.success("Coupon updated successfully");
      setEditTarget(null);
    } else {
      toast.error("Failed to update coupon");
    }
  };

  const handleToggleActive = async () => {
    if (!selectedCoupon) return;
    const next = !selectedCoupon.is_active;
    const ok = await toggleActive(selectedCoupon.id, next);
    if (ok) {
      toast.success(next ? "Coupon activated" : "Coupon deactivated");
    } else {
      toast.error("Failed to toggle coupon status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteCoupon(deleteTarget.id);
    if (ok) {
      toast.success(`Coupon "${deleteTarget.code}" deleted`);
    } else {
      toast.error("Failed to delete coupon");
    }
    setDeleteTarget(null);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const ok = await bulkDelete(ids);
    if (ok) {
      toast.success(`${ids.length} coupon${ids.length !== 1 ? "s" : ""} deleted`);
    } else {
      toast.error("Bulk delete failed");
    }
    setBulkDeleteOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Two-column shell */}
      <div className="flex h-full overflow-hidden gap-2">
        {/* Left — list */}
        <div className="w-80 shrink-0 flex flex-col overflow-hidden">
          <CouponListPanel
            coupons={coupons}
            meta={meta}
            loading={listLoading}
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterType={filterType}
            onFilterTypeChange={setFilterType}
            selectedCouponId={selectedCouponId}
            onSelectCoupon={(id) => selectCoupon(id)}
            selectedIds={selectedIds}
            onToggleCheckbox={(id, e) => {
              e.stopPropagation();
              toggleSelect(id);
            }}
            onClearSelection={clearSelection}
            onBulkDelete={() => setBulkDeleteOpen(true)}
            onEdit={(coupon, e) => {
              e.stopPropagation();
              setEditTarget(coupon);
            }}
            onDelete={(coupon, e) => {
              e.stopPropagation();
              setDeleteTarget(coupon);
            }}
            onPageChange={handlePageChange}
            onRefresh={() => loadCoupons()}
            onCreateOpen={() => setCreateOpen(true)}
          />
        </div>

        {/* Right — detail */}
        <div className="flex-1 overflow-hidden">
          <CouponDetailPanel
            coupon={selectedCoupon}
            loading={detailLoading}
            selectedCouponId={selectedCouponId}
            onEdit={() => setEditTarget(selectedCoupon)}
            onDelete={() => setDeleteTarget(selectedCoupon)}
            onToggleActive={handleToggleActive}
            mutating={mutating}
          />
        </div>
      </div>

      {/* Create dialog */}
      <CouponFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialCoupon={null}
        onSubmit={handleCreate}
        loading={mutating}
      />

      {/* Edit dialog */}
      <CouponFormDialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        initialCoupon={editTarget}
        onSubmit={handleEdit}
        loading={mutating}
      />

      {/* Single delete */}
      <CouponDeleteDialog
        coupon={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={mutating}
      />

      {/* Bulk delete */}
      <CouponBulkDeleteDialog
        count={selectedIds.size}
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        loading={mutating}
      />
    </>
  );
}