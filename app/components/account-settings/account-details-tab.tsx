import { Calendar, CheckCircle2, Shield, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import { Separator } from "../ui/separator";
import Button from "../custom-ui/button";
import { formatDate } from "~/lib/format-date";
import { useAuthStore } from "~/hooks/use-auth-store";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { User } from "wle-core";

export type AccountDetailsTabProps = {
    user: User,
    t: TFunction,
}

export function AccountDetailsTab({ user, t }: AccountDetailsTabProps) {
    return <TabsContent value="account" className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>{t('settings:accountDetails')}</CardTitle>
                <CardDescription>{t('settings:viewAccountInformation')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <UserIcon className="h-4 w-4" />
                            {t('settings:userId')}
                        </div>
                        <p className="font-medium">{user.id}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Shield className="h-4 w-4" />
                            {t('settings:role')}
                        </div>
                        <p className="font-medium capitalize">{user.role}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {t('settings:memberSince')}
                        </div>
                        <p className="font-medium">{formatDate(user.created_at)}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('settings:emailVerified')}
                        </div>
                        <p className="font-medium">{formatDate(user.email_verified_at)}</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('settings:approvedAt')}
                        </div>
                        {user.status &&
                            <p className="font-medium">{formatDate(user.status.created_at)}</p>}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {t('settings:lastUpdated')}
                        </div>
                        <p className="font-medium">{formatDate(user.updated_at)}</p>
                    </div>
                    {user.client_code_id && (
                        <div className="space-y-1">
                            <div className="text-sm text-gray-500">{t('settings:clientCodeId')}</div>
                            <p className="font-medium">{user.client_code_id}</p>
                        </div>
                    )}
                </div>
                <Separator />
                <div className="flex justify-end">
                    <Button variant="destructive">{t('settings:deleteAccount')}</Button>
                </div>
            </CardContent>
        </Card>
    </TabsContent>
}

export default function () {
    const user = useAuthStore((state) => state.user!);
    const { t } = useTranslation("settings");

    return <AccountDetailsTab user={user} t={t} />
}