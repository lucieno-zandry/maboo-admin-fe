import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ShieldAlert, ChevronLeft } from "lucide-react";
import { UserDetailTabs } from "./user-detail-tabs";
import { UserProfileHeader } from "./user-profile-header";
import { UserActions } from "./user-actions";
import { useState } from "react";
import { UserEditDialog } from "./user-edit-dialog";
import type { User } from "wle-core";

interface UserDetailLayoutProps {
    user: User | null;
    loading: boolean;
    error: string | null;
    onBack?: () => void;
    onEdit?: () => void;
    onApprove?: () => void;
    onBlock?: (reason: string) => void;
    onSuspend?: (reason: string, expiresAt?: string) => void;
}

export function UserDetailLayout({
    user,
    loading,
    error,
    onBack,
    onEdit,
    onApprove,
    onBlock,
    onSuspend,
}: UserDetailLayoutProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleEdit = () => setEditDialogOpen(true);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 p-8 text-red-600">
                <ShieldAlert className="h-8 w-8 mb-2 opacity-50" />
                <p className="font-medium">Failed to load user profile</p>
                <p className="text-sm opacity-80">{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-muted-foreground p-8 bg-muted/20">
                Select a user to view their detailed profile.
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-background/80 backdrop-static-md p-2 rounded-2xl h-full overflow-y-auto">
            {onBack && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden mb-2 -ml-2"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to list
                </Button>
            )}
            <Card className="overflow-hidden shadow-sm">
                <div className="h-20 bg-muted border-b border-border/50"></div>
                <CardContent className="p-6 pt-0 sm:flex sm:items-end sm:justify-between">
                    <UserProfileHeader user={user} />
                    <UserActions
                        user={user}
                        onEdit={handleEdit}
                        onApprove={onApprove}
                        onBlock={onBlock}
                        onSuspend={onSuspend}
                    />
                </CardContent>
            </Card>

            <UserDetailTabs user={user} />
            <UserEditDialog
                user={user}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen} />
        </div>
    );
}