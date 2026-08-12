import { useNavigate } from "react-router";
import { Eye, MoreHorizontal, RefreshCw, Send, Pencil, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { resendTransactionNotification } from "~/api/http-requests";
import useRouterStore from "~/hooks/use-router-store";
import type { Transaction } from "wle-core";

// ─── View ─────────────────────────────────────────────────────────────────────

export type TransactionRowActionsViewProps = {
    canResend: boolean;
    canRefund: boolean;
    onViewDetail: () => void;
    onResendNotification: () => void;
};

export function TransactionRowActionsView({
    canResend,
    canRefund,
    onViewDetail,
    onResendNotification,
}: TransactionRowActionsViewProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-zinc-900 border-zinc-800 text-zinc-300 text-sm min-w-[160px]"
            >
                <DropdownMenuItem
                    onClick={onViewDetail}
                    className="gap-2 cursor-pointer hover:text-white focus:bg-zinc-800"
                >
                    <Eye className="h-4 w-4" />
                    View detail
                </DropdownMenuItem>

                {canResend && (
                    <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                            onClick={onResendNotification}
                            className="gap-2 cursor-pointer hover:text-white focus:bg-zinc-800"
                        >
                            <Send className="h-4 w-4" />
                            Resend notification
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Smart ────────────────────────────────────────────────────────────────────

export type TransactionRowActionsProps = {
    transaction: Transaction;
};

export default function TransactionRowActions({
    transaction,
}: TransactionRowActionsProps) {
    const navigate = useNavigate();
    const { lang } = useRouterStore();

    const canResend =
        transaction.status === "SUCCESS" || transaction.status === "FAILED";
    const canRefund = transaction.status === "SUCCESS" && transaction.type === "PAYMENT";

    const handleResend = async () => {
        try {
            await resendTransactionNotification(transaction.uuid);
            toast.success("Notification resent successfully.");
        } catch {
            toast.error("Failed to resend notification.");
        }
    };

    return (
        <TransactionRowActionsView
            canResend={canResend}
            canRefund={canRefund}
            onViewDetail={() => navigate(`/${lang}/transactions/${transaction.uuid}`)}
            onResendNotification={handleResend}
        />
    );
}