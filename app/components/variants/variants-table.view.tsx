import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { useVariantsTable } from "./variants-table.controller";
import formatPrice from "~/lib/format-price";
import type { Variant, VariantGroup } from "wle-core";

type VariantsTableProps = {
  variants: Variant[];
  variantGroups: VariantGroup[];
};

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <Badge variant="destructive" className="text-xs py-0">
        Out
      </Badge>
    );
  if (stock <= 5)
    return (
      <Badge variant="secondary" className="text-xs py-0">
        {stock} left
      </Badge>
    );
  return <span className="text-sm text-muted-foreground">{stock}</span>;
}

export function VariantsTable({ variants, variantGroups }: VariantsTableProps) {
  const { rows, groupNames, totalStock } = useVariantsTable(variants, variantGroups);

  if (!rows.length || !groupNames.length) {
    return (
      <p className="text-sm text-muted-foreground italic">No variants configured.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variants</h3>
        <span className="text-xs text-muted-foreground">{totalStock} units total</span>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs py-2">SKU</TableHead>
              {groupNames.map((name) => (
                <TableHead key={name} className="text-xs py-2">
                  {name}
                </TableHead>
              ))}
              <TableHead className="text-xs py-2 text-right">Price</TableHead>
              <TableHead className="text-xs py-2 text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ variant, optionsByGroup }) => (
              <TableRow
                key={variant.id}
                className={cn(variant.stock === 0 && "opacity-50")}
              >
                <TableCell className="text-xs font-mono py-2">{variant.sku}</TableCell>
                {groupNames.map((name) => (
                  <TableCell key={name} className="text-xs py-2">
                    {optionsByGroup[name] ?? "—"}
                  </TableCell>
                ))}
                <TableCell className="text-xs py-2 text-right">
                  {variant.effective_price! < variant.price ? (
                    <span className="flex flex-col items-end">
                      <span className="font-semibold text-emerald-600">
                        {formatPrice(variant.effective_price)}
                      </span>
                      <span className="line-through text-muted-foreground">
                        {formatPrice(variant.price)}
                      </span>
                    </span>
                  ) : (
                    formatPrice(variant.price)
                  )}
                </TableCell>
                <TableCell className="text-xs py-2 text-right">
                  <StockBadge stock={variant.stock} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}