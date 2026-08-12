import { UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import type { User } from "wle-core";

export type UserRowProps = {
    user: User;
    onDetach: () => void;
    disabled: boolean;
};

export function UserRow({ user, onDetach, disabled }: UserRowProps) {
    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group">
            <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={user.avatar_image?.url} />
                <AvatarFallback className="text-[10px]">
                    {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Badge
                variant={
                    user.role === "admin"
                        ? "default"
                        : user.role === "manager"
                            ? "secondary"
                            : "outline"
                }
                className="text-[10px] shrink-0"
            >
                {user.role}
            </Badge>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 hover:text-destructive"
                            onClick={onDetach}
                            disabled={disabled}
                        >
                            <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove from code</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}