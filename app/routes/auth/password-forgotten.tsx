import { Button, Field as CustomField, BackButton } from "wle-ui-package";
import { Field, FieldGroup } from "~/components/ui/field";
import type { Route } from "./+types";
import { sendPasswordResetLink } from "~/api/http-requests";
import { Form, useActionData, useNavigation } from "react-router";
import React from "react";
import z from "zod";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import { toast } from "sonner";

const emailFormat = z.email();

export async function clientAction({ request }: Route.ClientActionArgs) {
    let formData = await request.formData();
    const email = formData.get('email') as string;

    try {
        const response = await sendPasswordResetLink(email);

        if (response.data?.link_sent) {
            toast.success("Password reset link sent");
        }
    } catch (e) {
        return e;
    }
}

export default function () {
    const actionData = useActionData<any>();
    const navigation = useNavigation();
    const isLoading = React.useMemo(() => navigation.state === "submitting", [navigation.state]);

    const [state, setState] = React.useState({
        data: {
            email: "",
        },
        formErrors: null as Record<"email", string[]> | null
    });

    const userCanSubmit = React.useMemo(() => !!(state.data.email && !state.formErrors), [state]);

    const handleValidationErrorsChange = React.useCallback((validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => {
        const name = e.target.name as "email";

        setState(s => {
            const updatedFormErrors = getUpdatedFormErrors({
                formErrors: s.formErrors,
                name,
                validationErrors
            })

            return { ...s, formErrors: updatedFormErrors, data: { ...s.data, [name]: e.target.value } }
        })
    }, []);

    return <Form className="p-6 md:p-8" method="post">
        <BackButton />

        <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-muted-foreground text-balance">
                    Type your email address
                </p>
            </div>

            <CustomField
                validationErrors={actionData?.errors?.email}
                label="Email"
                id="email"
                type="email"
                name="email"
                placeholder="username@example.com"
                dataFormat={emailFormat}
                onValidationErrorsChange={handleValidationErrorsChange}
                required />

            <Field>
                <Button type="submit" isLoading={isLoading} disabled={!userCanSubmit}>
                    Continue
                </Button>
            </Field>
        </FieldGroup>
    </Form>
}