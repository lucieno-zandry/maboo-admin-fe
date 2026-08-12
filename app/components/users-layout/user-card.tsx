// routes/backoffice/users/components/UserCard.tsx
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Clock, UserIcon } from "lucide-react";
import { cn } from "~/lib/utils"; // Ensure you have this utility
import { isUserApproved } from "~/lib/user-status";
import type { User } from "wle-core";

interface UserCardProps {
    user: User;
    isSelected: boolean;
    onClick: () => void;
}

export function UserCard({ user, isSelected, onClick }: UserCardProps) {
    const getRoleBadgeVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin": return "destructive";
            case "manager": return "default";
            case "client": return "secondary";
            default: return "outline";
        }
    };

    const approved = isUserApproved(user);

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left flex items-center gap-3 px-4 py-3 border-b border-border transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isSelected && "bg-muted border-l-2 border-l-primary"
            )}
        >
            {/* Thumbnail/Avatar */}
            <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center">
                <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.avatar_image?.url} alt={user.name} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-primary/5 text-primary">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                </p>
            </div>

            {/* Right side - Status and Role */}
            <div className="shrink-0 flex flex-col items-end gap-1">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] py-0 px-1.5 capitalize">
                    {user.role}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-medium">
                    {approved ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ) : (
                        <Clock className="h-3 w-3 text-amber-600" />
                    )}
                    <span className={approved ? "text-emerald-600" : "text-amber-600"}>
                        {approved ? "Approved" : "Pending"}
                    </span>
                </div>
            </div>
        </button>
    );
}