import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LinkIcon } from "lucide-react";
import { useTransactionDetailStore } from "~/hooks/use-transaction-detail-store";
import type { User } from "wle-core";

export type TransactionUserCardViewProps = {
    user: User;
};

export function TransactionUserCardView({ user }: TransactionUserCardViewProps) {
    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-zinc-300">Customer</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-200">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <Link
                        to={`/admin/users/${user.id}`}
                        className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                    >
                        <LinkIcon className="h-3 w-3" />
                        Profile
                    </Link>
                </div>
                <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
            </CardContent>
        </Card>
    );
}

export function TransactionUserCard() {
    const transaction = useTransactionDetailStore((s) => s.transaction);
    if (!transaction?.user) return null;

    return <TransactionUserCardView user={transaction.user} />;
}