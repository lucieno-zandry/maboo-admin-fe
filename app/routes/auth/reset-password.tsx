import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { resetPassword } from "~/api/http-requests";
import { Button, Field } from "wle-ui-package";
import { FieldGroup } from "~/components/ui/field";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";

const dataFormat = {
    password: z.string().min(4),
}

export const loader = ({ params }: LoaderFunctionArgs) => {
    const token = params.token;
    return token;
}

export const clientAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const password = formData.get('password');
    const passwordConfirmation = formData.get('password_confirmation');

    if (password?.toString() !== passwordConfirmation?.toString())
        return new ValidationException({
            password_confirmation: ["The password confirmation does not match."]
        },
            422,
            "The password confirmation does not match."
        );

    try {
        const response = await resetPassword(formData);

        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }

        return redirect('/');
    } catch (error) {
        if (error instanceof HttpException && error.status === 403) {
            toast.error("You do not have permission to perform this action!");
            return redirect('/');
        }

        return error;
    }
}

export default function () {
    const [formValidationErrors, setFormValidationErrors] = useState<{ password?: string[], password_confirmation?: string[] } | null>(null);
    const navigation = useNavigation();

    const token = useLoaderData<string>();
    const canSubmit = useMemo(() => !formValidationErrors, [formValidationErrors]);
    const isLoading = useMemo(() => navigation.state === "loading", [navigation]);

    const error = useActionData();

    useEffect(() => {
        if (!error) return;
        if (error instanceof ValidationException) {
            setFormValidationErrors(error.errors);
        } else {
            toast.error(`Failed to reset password with status : ${error.status}!`)
        }
    }, [error]);

    const handleValidationErrorsChange = useCallback((validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => {
        const name = e.target.name as "password" | "password_confirmation";


        setFormValidationErrors(f => {
            const updatedFormErrors = getUpdatedFormErrors({
                formErrors: f,
                name,
                validationErrors
            })

            return updatedFormErrors
        });
    }, []);
    return <Form className="p-6 md:p-8" method="post">
        <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-muted-foreground text-balance">
                    Create a new password for your account
                </p>
            </div>

            <input type="hidden" name="token" value={token} readOnly />
            <Field
                id="password"
                type="password"
                name="password"
                dataFormat={dataFormat.password}
                onValidationErrorsChange={handleValidationErrorsChange}
                validationErrors={formValidationErrors?.password}
                label="Password"
                required />

            <Field
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                dataFormat={dataFormat.password}
                onValidationErrorsChange={handleValidationErrorsChange}
                validationErrors={formValidationErrors?.password_confirmation}
                label="Confirm your password"
                required />

            <Button
                type="submit"
                disabled={!canSubmit}
                isLoading={isLoading}>Reset password</Button>
        </FieldGroup>
    </Form>
}