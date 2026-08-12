import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useAuthStore } from '~/hooks/use-auth-store';
import UserAvatar from './user-avatar';
import { LogoutDialog } from './logout-dialog';
import React from 'react';
import { Link } from 'react-router';
import { MapPin, Package, Settings, TicketPercent, LifeBuoy, LogOut, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import appPathname from '~/lib/app-pathname';
import { LanguageSwitcher } from './language-switcher';
import { ThemeSelector } from './theme-selector';
import type { User } from 'wle-core';

type UserDropdownProps = {
    user: User;
    setLogoutOpen: (open: boolean) => void;
    logoutOpen: boolean;
    t: any;
};

export function UserDropdown({ user, setLogoutOpen, logoutOpen, t }: UserDropdownProps) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <UserAvatar
                            avatarFallBack={user.name.substring(0, 2)}
                            avatarImageUrl={user.avatar_image?.url || undefined}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to={appPathname('/settings/account')} className="cursor-pointer">
                                <UserCog className="mr-2 h-4 w-4" />
                                <span>{t('common:account')}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={appPathname('/settings')} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t('common:settings')}</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Preferences Section - prevents menu closure on click */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('common:preferences')}
                    </div>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-default focus:bg-transparent">
                            <LanguageSwitcher type="dropdown" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-default focus:bg-transparent">
                            <ThemeSelector type="dropdown" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setLogoutOpen(true)}
                        className="cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('common:logOut')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </>
    );
}

export default function () {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const [logoutOpen, setLogoutOpen] = React.useState(false);

    if (!user) return null;

    return (
        <UserDropdown
            user={user}
            setLogoutOpen={setLogoutOpen}
            logoutOpen={logoutOpen}
            t={t}
        />
    );
}