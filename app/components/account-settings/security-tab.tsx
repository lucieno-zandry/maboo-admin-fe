import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import z from "zod";
import { Field } from "wle-ui-package";
import { updateAuthUser } from "~/api/http-requests";
import { toast } from "sonner";
import { ValidationException } from "~/api/app-fetch";
import { Button } from "wle-ui-package";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

const dataFormat = {
    passwordFormat: z.string().min(4)
}

type SecurityFormProps = {
    formData: {
        current_password: string;
        password: string;
        password_confirmation: string;
    };
    validationMessages?: Record<string, string[]> | null;
    dataFormat: { passwordFormat: any };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleValidationErrorsChange: (validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => void;
    canSubmit: boolean;
    isLoading: boolean;
    t: TFunction;
};

export function SecurityForm({
    formData,
    validationMessages,
    dataFormat,
    handleInputChange,
    handleSubmit,
    handleValidationErrorsChange,
    canSubmit,
    isLoading,
    t
}: SecurityFormProps) {
    return (
        <TabsContent value="security" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings:changePassword')}</CardTitle>
                    <CardDescription>
                        {t('settings:keepAccountSecure')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field
                            id="current_password"
                            name="current_password"
                            type="password"
                            value={formData.current_password}
                            onChange={handleInputChange}
                            placeholder={t('settings:enterCurrentPassword')}
                            label={t('settings:currentPassword')}
                            dataFormat={dataFormat.passwordFormat}
                            validationErrors={validationMessages?.current_password}
                            onValidationErrorsChange={handleValidationErrorsChange}
                        />

                        <Field
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={t('settings:enterNewPassword')}
                            label={t('settings:newPassword')}
                            dataFormat={dataFormat.passwordFormat}
                            validationErrors={validationMessages?.password}
                            onValidationErrorsChange={handleValidationErrorsChange}
                        />

                        <Field
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            placeholder={t('settings:confirmNewPassword')}
                            label={t('settings:confirmNewPassword')}
                            dataFormat={dataFormat.passwordFormat}
                            onValidationErrorsChange={handleValidationErrorsChange}
                        />

                        <Button type="submit" disabled={!canSubmit} isLoading={isLoading}>
                            {t('settings:updatePassword')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </TabsContent>
    );
}

export default function () {
    const [formData, setFormData] = useState({
        current_password: "",
        password: "",
        password_confirmation: ""
    })

    const [validationMessages, setValidationMessages] = useState<Record<string, string[]> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation("settings");

    const canSubmit = useMemo(() => Object.keys(formData).every(key => !!formData[key as keyof typeof formData]) &&
        formData.password === formData.password_confirmation &&
        !validationMessages,
        [formData, validationMessages]);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            return setValidationMessages({ password_confirmation: ["The password confirmation does not match!"] })
        }

        setIsLoading(true);
        updateAuthUser(formData)
            .then(() => {
                toast.success("Password updated successfuly!");
                setFormData({ ...formData, password: "", password_confirmation: "" });
            })
            .catch(error => {
                if (error instanceof ValidationException) {
                    setValidationMessages(error.errors);
                } else {
                    toast.error("Failed to update password with status : " + error.status);
                }
            })
            .finally(() => {
                setIsLoading(false);
            })
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleValidationErrorsChange = (validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => {
        setValidationMessages(v => {
            const updatedValidationMessages = getUpdatedFormErrors({
                formErrors: v,
                name: e.target.name,
                validationErrors,
            })

            return updatedValidationMessages;
        })
    }

    return <SecurityForm
        canSubmit={canSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        dataFormat={dataFormat}
        handleSubmit={handleSubmit}
        handleValidationErrorsChange={handleValidationErrorsChange}
        isLoading={isLoading}
        validationMessages={validationMessages}
        t={t}
    />
}