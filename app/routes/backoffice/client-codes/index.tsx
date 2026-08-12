// routes/backoffice/client-codes/index.tsx
import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
    Trash2,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useClientCodesStore } from "~/hooks/use-client-codes-store";
import useDebounce from "~/hooks/use-debounce";
import { CodeListPanel } from "~/components/client-codes/code-list-panel";
import { DetailPanel } from "~/components/client-codes/detail-panel";
import { CodeFormDialog } from "~/components/client-codes/code-form-dialog";
import type { ClientCode } from "wle-core";

export default function ClientCodesPage() {
    const {
        codes,
        meta,
        listLoading,
        selectedCodeId,
        selectedCode,
        detailLoading,
        selectedIds,
        mutating,
        params,
        loadCodes,
        selectCode,
        setParams,
        toggleSelect,
        selectAll,
        clearSelection,
        createCode,
        updateCode,
        deleteCode,
        bulkDelete,
        detachUser,
    } = useClientCodesStore();

    // Local UI state
    const [search, setSearch] = useState(params.search ?? "");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ClientCode | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ClientCode | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const debouncedSearch = useDebounce(search, 350);

    // Initial load
    useEffect(() => {
        loadCodes();
    }, []);

    // Reload when search/filter changes
    useEffect(() => {
        const isActive =
            filterActive === "all" ? "all" : filterActive === "active" ? true : false;
        setParams({ search: debouncedSearch || undefined, is_active: isActive, page: 1 });
        loadCodes({
            search: debouncedSearch || undefined,
            is_active: isActive,
            page: 1,
        });
    }, [debouncedSearch, filterActive]);

    const handlePageChange = (page: number) => {
        setParams({ page });
        loadCodes({ page });
    };

    const handleRefresh = () => loadCodes();

    // Create
    const handleCreate = async (data: {
        code: string;
        is_active: boolean;
        max_uses: number | null;
    }) => {
        const result = await createCode(data);
        if (result) {
            toast.success(`Code "${result.code}" created successfully`);
            setCreateOpen(false);
            selectCode(result.id);
        } else {
            toast.error("Failed to create code");
        }
    };

    // Edit
    const handleEdit = async (data: {
        code: string;
        is_active: boolean;
        max_uses: number | null;
    }) => {
        if (!editTarget) return;
        const result = await updateCode(editTarget.id, data);
        if (result) {
            toast.success(`Code updated successfully`);
            setEditTarget(null);
        } else {
            toast.error("Failed to update code");
        }
    };

    // Toggle active
    const handleToggleActive = async () => {
        if (!selectedCode) return;
        await updateCode(selectedCode.id, { is_active: !selectedCode.is_active });
        toast.success(
            selectedCode.is_active ? "Code deactivated" : "Code activated"
        );
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget) return;
        const ok = await deleteCode(deleteTarget.id);
        if (ok) {
            toast.success(`Code "${deleteTarget.code}" deleted`);
        } else {
            toast.error("Failed to delete code");
        }
        setDeleteTarget(null);
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        const ok = await bulkDelete(ids);
        if (ok) {
            toast.success(`${ids.length} code${ids.length !== 1 ? "s" : ""} deleted`);
        } else {
            toast.error("Bulk delete failed");
        }
        setBulkDeleteOpen(false);
    };

    // Detach user
    const handleDetachUser = async (userId: number) => {
        if (!selectedCodeId) return;
        const ok = await detachUser(selectedCodeId, userId);
        if (ok) toast.success("User removed from code");
        else toast.error("Failed to remove user");
    };

    return (
        <>
            {/* Two-column layout */}
            <div className="flex h-full overflow-hidden gap-2">
                {/* Left column — list (fixed width) */}
                <div className="w-80 shrink-0 flex flex-col overflow-hidden">
                    <CodeListPanel
                        codes={codes}
                        meta={meta}
                        loading={listLoading}
                        search={search}
                        onSearchChange={setSearch}
                        filterActive={filterActive}
                        onFilterChange={setFilterActive}
                        selectedCodeId={selectedCodeId}
                        onSelectCode={(id) => selectCode(id)}
                        selectedIds={selectedIds}
                        onToggleCheckbox={(id, e) => {
                            e.stopPropagation();
                            toggleSelect(id);
                        }}
                        onSelectAll={selectAll}
                        onClearSelection={clearSelection}
                        onBulkDelete={() => setBulkDeleteOpen(true)}
                        onEdit={(code, e) => {
                            e.stopPropagation();
                            setEditTarget(code);
                        }}
                        onDelete={(code, e) => {
                            e.stopPropagation();
                            setDeleteTarget(code);
                        }}
                        onPageChange={handlePageChange}
                        onRefresh={handleRefresh}
                        onCreateOpen={() => setCreateOpen(true)}
                    />
                </div>

                {/* Right column — detail */}
                <div className="flex-1 overflow-hidden">
                    <DetailPanel
                        code={selectedCode}
                        loading={detailLoading}
                        selectedCodeId={selectedCodeId}
                        onEdit={() => setEditTarget(selectedCode)}
                        onDelete={() => setDeleteTarget(selectedCode)}
                        onToggleActive={handleToggleActive}
                        onDetachUser={handleDetachUser}
                        mutating={mutating}
                    />
                </div>
            </div>

            {/* Create Dialog */}
            <CodeFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                initialCode={null}
                onSubmit={handleCreate}
                loading={mutating}
            />

            {/* Edit Dialog */}
            <CodeFormDialog
                open={!!editTarget}
                onOpenChange={(v) => !v && setEditTarget(null)}
                initialCode={editTarget}
                onSubmit={handleEdit}
                loading={mutating}
            />

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Code</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-mono font-semibold">{deleteTarget?.code}</span>?
                            This action cannot be undone and will remove access for all associated users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {mutating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} codes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedIds.size} client code
                            {selectedIds.size !== 1 ? "s" : ""}. All associated user access will be revoked.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete {selectedIds.size} codes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}