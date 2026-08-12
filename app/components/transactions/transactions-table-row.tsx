import { Link } from "react-router";
import { Checkbox } from "~/components/ui/checkbox";
import { TableCell, TableRow } from "~/components/ui/table";
import TransactionTypeBadge from "./transaction-type-badge";
import TransactionStatusBadge from "./transaction-status-badge";
import formatPrice from "~/lib/format-price";
import TransactionMethodBadge from "./transaction-method-badge";
import { DisputeStatusBadge } from "./dispute-status-badge";
import { formatDate } from "~/lib/format-date";
import TransactionRowActions from "./transaction-row-actions";
import { useTransactionsListStore } from "~/hooks/use-transactions-list-store";
import type { Transaction } from "wle-core";
// ─── View ─────────────────────────────────────────────────────────────────────

export type TransactionsTableRowViewProps = {
  transaction: Transaction;
  isSelected: boolean;
  onToggleSelect: () => void;
};

export function TransactionsTableRowView({
  transaction: t,
  isSelected,
  onToggleSelect,
}: TransactionsTableRowViewProps) {
  return (
    <TableRow
      className={`group border-zinc-800 hover:bg-zinc-900/60 transition-colors ${
        isSelected ? "bg-zinc-900/80" : ""
      }`}
    >
      {/* Checkbox */}
      <TableCell className="w-10 pl-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          className="border-zinc-700"
        />
      </TableCell>

      {/* Type + Status */}
      <TableCell>
        <div className="flex flex-col gap-1">
          <TransactionTypeBadge type={t.type} />
          <TransactionStatusBadge status={t.status} />
        </div>
      </TableCell>

      {/* User */}
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm text-zinc-200 font-medium truncate max-w-[140px]">
            {t.user?.name ?? "—"}
          </span>
          <span className="text-xs text-zinc-500 truncate max-w-[140px]">
            {t.user?.email ?? "—"}
          </span>
        </div>
      </TableCell>

      {/* Amount */}
      <TableCell className="font-mono text-sm font-semibold text-zinc-100 tabular-nums">
        {formatPrice(t.amount)}
      </TableCell>

      {/* Method */}
      <TableCell>
        <TransactionMethodBadge method={t.payment_method} />
      </TableCell>

      {/* Order UUID */}
      <TableCell>
        <Link
          to={`/admin/orders/${t.order_uuid}`}
          className="font-mono text-xs text-zinc-400 hover:text-violet-400 transition-colors truncate block max-w-[120px]"
          title={t.order_uuid}
        >
          {t.order_uuid.slice(0, 8)}…
        </Link>
      </TableCell>

      {/* Dispute */}
      <TableCell>
        {t.dispute_status ? (
          <DisputeStatusBadge status={t.dispute_status} />
        ) : (
          <span className="text-zinc-700 text-xs">—</span>
        )}
      </TableCell>

      {/* Date */}
      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
        {formatDate(t.created_at)}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right pr-4">
        <TransactionRowActions transaction={t} />
      </TableCell>
    </TableRow>
  );
}

// ─── Smart ────────────────────────────────────────────────────────────────────

export type TransactionsTableRowProps = {
  transaction: Transaction;
};

export default function TransactionsTableRow({
  transaction,
}: TransactionsTableRowProps) {
  const { selectedUuids, toggleRow } = useTransactionsListStore();

  return (
    <TransactionsTableRowView
      transaction={transaction}
      isSelected={selectedUuids.has(transaction.uuid)}
      onToggleSelect={() => toggleRow(transaction.uuid)}
    />
  );
}