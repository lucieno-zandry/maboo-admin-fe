import z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";;
import { Button, Field } from "wle-ui-package";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type ConfirmEmailChangeDialogProps = {
    showPasswordDialog: boolean;
    setShowPasswordDialog: (show: boolean) => void;
    confirmEmailChange: (email: string) => void;
    pendingEmail: string;
    cancelEmailChange: () => void;
    currentPasswordValidationErrors?: string[] | null;
    isLoading: boolean;
    t: TFunction;
}

const passwordFormat = z.string().min(4);

export function ConfirmEmailChangeDialog({
    setShowPasswordDialog,
    showPasswordDialog,
    confirmEmailChange,
    pendingEmail,
    cancelEmailChange,
    currentPasswordValidationErrors,
    isLoading,
    t
}: ConfirmEmailChangeDialogProps) {
    return <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent aria-describedby="Change email address">
            <form
                method="post"
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    confirmEmailChange(e.currentTarget.querySelector<HTMLInputElement>('#current_password')!.value);
                }}>
                <DialogHeader>
                    <DialogTitle>{t('settings:confirmEmailChange')}</DialogTitle>
                    <DialogDescription>
                        {t('settings:confirmEmailChangeDescription', { email: pendingEmail })}
                    </DialogDescription>
                </DialogHeader>
                <Field
                    label={t('settings:currentPassword')}
                    id="current_password"
                    type="password"
                    placeholder={t('settings:enterCurrentPassword')}
                    dataFormat={passwordFormat}
                    validationErrors={currentPasswordValidationErrors}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={cancelEmailChange} type="button">
                        {t('settings:cancel')}
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {t('settings:confirmChange')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
}

export default function (props: Omit<ConfirmEmailChangeDialogProps, "t">) {
    const { t } = useTranslation("settings");

    return <ConfirmEmailChangeDialog {...props} t={t} />
}