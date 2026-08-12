import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import TransactionsTableRow from "./transactions-table-row";
import { useTransactionsListStore } from "~/hooks/use-transactions-list-store";
import type { Transaction } from "wle-core";


// ─── Sort Header ──────────────────────────────────────────────────────────────

type SortableKey = "created_at" | "amount" | "status";

function SortHeader({
    label,
    sortKey,
    current,
    dir,
    onSort,
}: {
    label: string;
    sortKey: SortableKey;
    current?: string;
    dir?: string;
    onSort: (key: SortableKey) => void;
}) {
    const isActive = current === sortKey;
    return (
        <button
            onClick={() => onSort(sortKey)}
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
            {label}
            {isActive ? (
                dir === "asc" ? (
                    <ArrowUp className="h-3 w-3" />
                ) : (
                    <ArrowDown className="h-3 w-3" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 opacity-30" />
            )}
        </button>
    );
}

// ─── View ─────────────────────────────────────────────────────────────────────

export type TransactionsTableViewProps = {
    transactions: Transaction[];
    isLoading: boolean;
    allSelected: boolean;
    sort: { by?: string; dir?: string };
    onToggleAll: () => void;
    onSort: (key: SortableKey) => void;
};

export function TransactionsTableView({
    transactions,
    isLoading,
    allSelected,
    sort,
    onToggleAll,
    onSort,
}: TransactionsTableViewProps) {
    return (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="w-10 pl-4">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={onToggleAll}
                                className="border-zinc-700"
                            />
                        </TableHead>
                        <TableHead className="text-xs text-zinc-500">Status</TableHead>
                        <TableHead className="text-xs text-zinc-500">User</TableHead>
                        <TableHead className="text-xs text-zinc-500">
                            <SortHeader
                                label="Amount"
                                sortKey="amount"
                                current={sort.by}
                                dir={sort.dir}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="text-xs text-zinc-500">Method</TableHead>
                        <TableHead className="text-xs text-zinc-500">Order</TableHead>
                        <TableHead className="text-xs text-zinc-500">Dispute</TableHead>
                        <TableHead className="text-xs text-zinc-500">
                            <SortHeader
                                label="Date"
                                sortKey="created_at"
                                current={sort.by}
                                dir={sort.dir}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i} className="border-zinc-800">
                                {Array.from({ length: 10 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full bg-zinc-800" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : transactions.length === 0 ? (
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableCell
                                colSpan={10}
                                className="text-center py-16 text-zinc-600 text-sm"
                            >
                                No transactions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        transactions.map((t) => (
                            <TransactionsTableRow key={t.uuid} transaction={t} />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// ─── Smart ────────────────────────────────────────────────────────────────────

export default function TransactionsTable() {
    const { transactions, isLoading, selectedUuids, sort, setSort, toggleAllRows } =
        useTransactionsListStore();

    const allSelected =
        transactions.length > 0 &&
        transactions.every((t) => selectedUuids.has(t.uuid));

    return (
        <TransactionsTableView
            transactions={transactions}
            isLoading={isLoading}
            allSelected={allSelected}
            sort={sort}
            onToggleAll={toggleAllRows}
            onSort={(key) =>
                setSort({
                    by: key,
                    dir: sort.by === key && sort.dir === "desc" ? "asc" : "desc",
                })
            }
        />
    );
}