import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import React from "react";
import { useAuthStore } from "~/hooks/use-auth-store";
import ConfirmEmailChangeDialog from "./confirm-email-change-dialog";
import { updateAuthUser } from "~/api/http-requests";
import { toast } from "sonner";
import { Button, Field } from "wle-ui-package";
import z from "zod";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import useRedirectAction from "~/hooks/use-redirect-action";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import appPathname from "~/lib/app-pathname";

const dataFormat = {
    email: z.email(),
    name: z.string().min(4)
}

type ValidationMessages = {
    name?: string[],
    email?: string[],
    current_password?: string[],
}

type ProfileFormProps = {
    formData: { name: string; email: string };
    validationMessages?: { [key: string]: string[] };
    dataFormat: { [key: string]: any };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleProfileUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
    handleValidationErrorsChange: (validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => void;
    userCanSubmit: boolean;
    isLoading: boolean;
    showPasswordDialog: boolean;
    setShowPasswordDialog: (open: boolean) => void;
    cancelEmailChange: () => void;
    confirmEmailChange: (current_password: string) => void;
    pendingEmail: string;
    t: TFunction;
};

export function ProfileForm({
    formData,
    validationMessages,
    dataFormat,
    handleInputChange,
    handleProfileUpdate,
    handleValidationErrorsChange,
    userCanSubmit,
    isLoading,
    showPasswordDialog,
    setShowPasswordDialog,
    cancelEmailChange,
    confirmEmailChange,
    pendingEmail,
    t,
}: ProfileFormProps) {
    return (
        <>
            <TabsContent value="profile" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings:profileInformation')}</CardTitle>
                        <CardDescription>{t('settings:updatePersonalDetails')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleProfileUpdate}
                            className="space-y-4 flex flex-col gap-3 items-end"
                        >
                            <Field
                                label={t('settings:fullName')}
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder={t('settings:enterFullName')}
                                validationErrors={validationMessages?.name}
                                dataFormat={dataFormat.name}
                                onValidationErrorsChange={handleValidationErrorsChange}
                            />

                            <Field
                                label={t('settings:emailAddress')}
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder={t('settings:enterEmail')}
                                validationErrors={validationMessages?.email}
                                dataFormat={dataFormat.email}
                                onValidationErrorsChange={handleValidationErrorsChange}
                            />

                            <Button
                                type="submit"
                                disabled={!userCanSubmit}
                                isLoading={!showPasswordDialog && isLoading}
                            >
                                {t('settings:saveChanges')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <ConfirmEmailChangeDialog
                cancelEmailChange={cancelEmailChange}
                confirmEmailChange={confirmEmailChange}
                pendingEmail={pendingEmail}
                setShowPasswordDialog={setShowPasswordDialog}
                showPasswordDialog={showPasswordDialog}
                currentPasswordValidationErrors={validationMessages?.current_password}
                isLoading={showPasswordDialog && isLoading}
            />
        </>
    );
}


export default function () {
    const user = useAuthStore((state) => state.user!);
    const { setUser } = useAuthStore();
    const { redirect } = useRedirectAction();
    const { t } = useTranslation("settings");

    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
    })

    const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
    const [pendingEmail, setPendingEmail] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [validationMessages, setValidationMessages] = React.useState<ValidationMessages | null>(null);

    const userCanSubmit = React.useMemo(() => (formData.name !== user.name || formData.email !== user.email) && !validationMessages, [formData, user, validationMessages]);

    React.useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
            })
        }
    }, [user])

    const handleError = (error: any) => {
        if (error.errors) {
            setValidationMessages(error.errors);
        }
    }

    const handleProfileUpdate: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        // Check if email has changed
        if (formData.email !== user.email) {
            setPendingEmail(formData.email);
            setShowPasswordDialog(true);
            return;
        }

        setIsLoading(true);

        updateAuthUser({ name: formData.name })
            .then(response => {
                if (response.data?.user) {
                    setUser(response.data.user);
                    toast.success(t('settings:profileUpdatedSuccess'));
                }
            }).catch(handleError)
            .finally(() => setIsLoading(false));
    };

    const cancelEmailChange = () => {
        setFormData({ ...formData, email: user.email });
        setShowPasswordDialog(false);
        setPendingEmail("");
    };

    const confirmEmailChange = React.useCallback((current_password: string) => {
        setIsLoading(true);

        updateAuthUser({ name: formData.name, email: pendingEmail, current_password })
            .then(response => {
                if (response.data?.user) {
                    setUser(response.data.user);
                    toast.success(t('settings:profileUpdatedSuccess'));
                    return redirect(appPathname(`/auth/verify-email`));
                }
            })
            .catch(error => {
                handleError(error);
                if ((error.errors.email || error.errors.name)) {
                    setShowPasswordDialog(false);
                    toast.error(t('settings:checkFieldErrors'));
                }
            })
            .finally(() => setIsLoading(false));
    }, [formData.name, pendingEmail, t]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleValidationErrorsChange = (validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => {
        // delete current_password if set
        if (validationMessages?.current_password && e.target.name !== "current_password") {
            delete validationMessages.current_password;
        }

        let updatedValidationMessages = getUpdatedFormErrors({
            formErrors: validationMessages,
            name: e.target.name as keyof ValidationMessages,
            validationErrors
        })

        setValidationMessages(updatedValidationMessages);
    }

    return <ProfileForm
        formData={formData}
        validationMessages={validationMessages || undefined}
        dataFormat={dataFormat}
        handleInputChange={handleInputChange}
        handleProfileUpdate={handleProfileUpdate}
        handleValidationErrorsChange={handleValidationErrorsChange}
        userCanSubmit={userCanSubmit}
        isLoading={isLoading}
        showPasswordDialog={showPasswordDialog}
        setShowPasswordDialog={setShowPasswordDialog}
        cancelEmailChange={cancelEmailChange}
        confirmEmailChange={confirmEmailChange}
        pendingEmail={pendingEmail}
        t={t}
    />
}