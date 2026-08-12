// routes/backoffice/promotions/index.tsx
import { useEffect, useState } from "react";
import { usePromotionsStore } from "~/hooks/use-promotions-store";
import { PromotionListPanel } from "~/components/promotions/promotion-list-panel";
import { PromotionDetailPanel } from "~/components/promotions/promotion-detail-panel";
import { PromotionFormDialog } from "~/components/promotions/promotion-form-dialog";
import {
    PromotionDeleteDialog,
    PromotionBulkDeleteDialog,
} from "~/components/promotions/promotion-delete-dialog";
import { toast } from "sonner";
import type { CreatePromotionData, PromotionsQueryParams } from "~/types/promotions";
import useDebounce from "~/hooks/use-debounce";
import type { Promotion } from "wle-core";

// ─────────────────────────────────────────────────────────────────────────────
// Smart component — owns all side effects, zero UI logic
// ─────────────────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
    const {
        promotions,
        meta,
        listLoading,
        selectedPromotionId,
        selectedPromotion,
        detailLoading,
        selectedIds,
        mutating,
        params,
        loadPromotions,
        selectPromotion,
        setParams,
        toggleSelect,
        selectAll,
        clearSelection,
        createPromotion,
        updatePromotion,
        toggleActive,
        deletePromotion,
        bulkDelete,
        detachVariant,
        refreshDetail,
    } = usePromotionsStore();

    // ── Local UI state ──────────────────────────────────────────────────────

    const [search, setSearch] = useState(params.search ?? "");
    const [filterStatus, setFilterStatus] = useState<
        "all" | "active" | "inactive" | "expired" | "scheduled"
    >("all");
    const [filterAudience, setFilterAudience] = useState<
        "all" | "client_code_only" | "regular_only"
    >("all");
    const [filterType, setFilterType] = useState<
        "all" | "PERCENTAGE" | "FIXED_AMOUNT"
    >("all");
    const [sortBy, setSortBy] = useState<PromotionsQueryParams["sort_by"]>(
        params.sort_by ?? "priority"
    );

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Promotion | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 350);

    // ── Initial load ────────────────────────────────────────────────────────

    useEffect(() => {
        loadPromotions();
    }, []);

    // ── Reload on filter / search / sort changes ────────────────────────────

    useEffect(() => {
        // "expired" and "scheduled" are best handled client-side (or
        // pass them as-is if your backend supports it)
        const isActive =
            filterStatus === "all"
                ? "all"
                : filterStatus === "active"
                    ? true
                    : filterStatus === "inactive"
                        ? false
                        : "all"; // expired / scheduled: load all, list item derives status

        const newParams: PromotionsQueryParams = {
            search: debouncedSearch || undefined,
            is_active: isActive as boolean | "all",
            type: filterType === "all" ? undefined : filterType,
            applies_to: filterAudience === "all" ? undefined : filterAudience,
            sort_by: sortBy,
            sort_order: sortBy === "priority" ? "asc" : "desc",
            page: 1,
        };

        setParams(newParams);
        loadPromotions(newParams);
    }, [debouncedSearch, filterStatus, filterAudience, filterType, sortBy]);

    // ── Pagination ──────────────────────────────────────────────────────────

    const handlePageChange = (page: number) => {
        setParams({ page });
        loadPromotions({ page });
    };

    // ── CRUD handlers ───────────────────────────────────────────────────────

    const handleCreate = async (data: CreatePromotionData) => {
        const result = await createPromotion(data);
        if (result) {
            toast.success(`Promotion "${result.name}" created`);
            setCreateOpen(false);
        } else {
            toast.error("Failed to create promotion");
        }
    };

    const handleEdit = async (data: CreatePromotionData) => {
        if (!editTarget) return;
        const result = await updatePromotion(editTarget.id, data);
        if (result) {
            toast.success("Promotion updated");
            setEditTarget(null);
        } else {
            toast.error("Failed to update promotion");
        }
    };

    const handleToggleActive = async () => {
        if (!selectedPromotion) return;
        const next = !selectedPromotion.is_active;
        const ok = await toggleActive(selectedPromotion.id, next);
        if (ok) {
            toast.success(next ? "Promotion activated" : "Promotion deactivated");
        } else {
            toast.error("Failed to toggle promotion status");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deletePromotion(deleteTarget.id);
        if (ok) {
            toast.success(`"${deleteTarget.name}" deleted`);
        } else {
            toast.error("Failed to delete promotion");
        }
        setDeleteTarget(null);
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        const ok = await bulkDelete(ids);
        if (ok) {
            toast.success(
                `${ids.length} promotion${ids.length !== 1 ? "s" : ""} deleted`
            );
        } else {
            toast.error("Bulk delete failed");
        }
        setBulkDeleteOpen(false);
    };

    const handleDetachVariant = async (variantId: number) => {
        if (!selectedPromotionId) return;
        const ok = await detachVariant(selectedPromotionId, variantId);
        if (ok) toast.success("Variant removed from promotion");
        else toast.error("Failed to remove variant");
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            <div className="flex h-full overflow-hidden gap-2">
                {/* Left — list */}
                <div className="w-80 shrink-0 flex flex-col overflow-hidden">
                    <PromotionListPanel
                        promotions={promotions}
                        meta={meta}
                        loading={listLoading}
                        search={search}
                        onSearchChange={setSearch}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        filterAudience={filterAudience}
                        onFilterAudienceChange={setFilterAudience}
                        filterType={filterType}
                        onFilterTypeChange={setFilterType}
                        sortBy={sortBy}
                        onSortByChange={setSortBy}
                        selectedPromotionId={selectedPromotionId}
                        onSelectPromotion={(id) => selectPromotion(id)}
                        selectedIds={selectedIds}
                        onToggleCheckbox={(id, e) => {
                            e.stopPropagation();
                            toggleSelect(id);
                        }}
                        onClearSelection={clearSelection}
                        onBulkDelete={() => setBulkDeleteOpen(true)}
                        onEdit={(promotion, e) => {
                            e.stopPropagation();
                            setEditTarget(promotion);
                        }}
                        onDelete={(promotion, e) => {
                            e.stopPropagation();
                            setDeleteTarget(promotion);
                        }}
                        onPageChange={handlePageChange}
                        onRefresh={() => loadPromotions()}
                        onCreateOpen={() => setCreateOpen(true)}
                    />
                </div>

                {/* Right — detail */}
                <div className="flex-1 overflow-hidden">
                    <PromotionDetailPanel
                        promotion={selectedPromotion}
                        loading={detailLoading}
                        selectedPromotionId={selectedPromotionId}
                        onEdit={() => setEditTarget(selectedPromotion)}
                        onDelete={() => setDeleteTarget(selectedPromotion)}
                        onToggleActive={handleToggleActive}
                        onDetachVariant={handleDetachVariant}
                        onVariantsAssigned={() => {
                            if (selectedPromotionId) {
                                refreshDetail();
                            }
                        }}
                        mutating={mutating}
                    />
                </div>
            </div>

            {/* Dialogs */}
            <PromotionFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                initialPromotion={null}
                onSubmit={handleCreate}
                loading={mutating}
            />

            <PromotionFormDialog
                open={!!editTarget}
                onOpenChange={(v) => !v && setEditTarget(null)}
                initialPromotion={editTarget}
                onSubmit={handleEdit}
                loading={mutating}
            />

            <PromotionDeleteDialog
                promotion={deleteTarget}
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={mutating}
            />

            <PromotionBulkDeleteDialog
                count={selectedIds.size}
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                onConfirm={handleBulkDelete}
                loading={mutating}
            />
        </>
    );
}