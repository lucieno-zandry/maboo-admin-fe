// routes/backoffice/users/components/UserProfileHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Clock, Mail, Calendar, Ban } from "lucide-react";
import { getCurrentUserStatus, isUserApproved } from "~/lib/user-status";
import type { User } from "wle-core";

interface UserProfileHeaderProps {
    user: User;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
    const getRoleBadgeVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin": return "destructive";
            case "manager": return "default";
            case "client": return "secondary";
            default: return "outline";
        }
    };

    const approved = isUserApproved(user);
    const currentStatus = getCurrentUserStatus(user);

    return (
        <div className="sm:flex sm:gap-6 sm:items-end">
            <Avatar className="h-24 w-24 rounded-xl border-4 border-background shadow-sm -mt-10 bg-muted">
                <AvatarImage src={user.avatar_image?.url} className="object-cover" />
                <AvatarFallback className="text-3xl rounded-xl">
                    {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="mt-4 sm:mt-0 space-y-1.5 pb-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase text-[10px] tracking-wider">
                        {user.role}
                    </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 opacity-70" /> {user.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 opacity-70" /> Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                        {approved ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-500">Approved</span>
                            </>
                        ) : (
                            <>
                                <Clock className="h-4 w-4 text-amber-500" />
                                <span className="text-amber-600 dark:text-amber-500">{currentStatus?.status}</span>
                            </>
                        )}
                    </span>

                    {(currentStatus?.reason || currentStatus?.expires_at) && (
                        <div className="flex items-center gap-1 text-xs">
                            <span>
                                {currentStatus.reason && `Reason: ${currentStatus.reason}`}
                                {currentStatus.expires_at && ` · Expires: ${new Date(currentStatus.expires_at).toLocaleDateString()}`}
                            </span>
                        </div>
                    )}
                    {user.client_code && (
                        <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-md text-foreground">
                            <span className="opacity-70">Code:</span> <span className="font-mono">{user.client_code.code}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}