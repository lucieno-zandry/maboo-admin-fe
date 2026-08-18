import { Button, Field as CustomField, BackButton } from "wle-ui-package"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "~/components/ui/field"
import z from "zod";
import { redirect, useLoaderData, useNavigate, useParams } from "react-router";
import type { Route } from "./+types";
import { getEmailInfo, registerUser } from "~/api/http-requests";
import React, { useMemo, useState, type FormEventHandler } from "react";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";

import { toast } from "sonner";
import { ValidationException } from "~/api/app-fetch";

const dataFormat = {
  password: z.string().min(4),
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const response = email && await getEmailInfo(email);
  const { lang } = params;

  if (response && response.data?.is_taken === false) {
    return email;
  }

  return redirect(`/${lang}/auth`);
}

export default function () {
  const email = useLoaderData<string>();

  const [formValidationErrors, setFormValidationErrors] = useState<{ password?: string[], password_confirmation?: string[] } | null>(null);

  const [data, setData] = useState({
    password: '',
    password_confirmation: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const canSubmit = useMemo(() => !formValidationErrors && data.password && data.password === data.password_confirmation, [formValidationErrors, data]);
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();

  const handleValidationErrorsChange = React.useCallback((validationErrors: string[] | null, e: React.FocusEvent<HTMLInputElement, Element>) => {
    const name = e.target.name as "password" | "password_confirmation";

    setFormValidationErrors(f => {
      const updatedFormErrors = getUpdatedFormErrors({
        formErrors: f,
        name,
        validationErrors
      })

      return updatedFormErrors
    });

    setData(d => ({ ...d, [name]: e.target.value }));
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    registerUser({
      email: formData.get("email")!,
      password: formData.get("password")!,
      password_confirmation: formData.get("password_confirmation")!,
      role: "admin"
    })
      .then(response => {
        toast.success("Register successful!");

        if (response.data?.token) {
          localStorage.setItem("token", response.data.token);
        }

        navigate(`/${lang}/auth/verify-email`);
      })
      .catch(error => {
        if (error instanceof ValidationException) {
          return setFormValidationErrors(error.errors);
        }

        toast.error(`Failed to register : ${error.status}`, { description: error.data.message });
      })
      .finally(() => setIsLoading(false));
  }

  return <form className="p-6 md:p-8" method="post" onSubmit={handleSubmit}>
    <BackButton />
    <FieldGroup>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <p className="text-muted-foreground text-balance">
          Create an account for free
        </p>
      </div>

      <CustomField
        label="Email"
        id="email"
        type="email"
        name="email"
        value={email}
        readOnly
        required
      />

      <CustomField
        id="password"
        type="password"
        name="password"
        dataFormat={dataFormat.password}
        onValidationErrorsChange={handleValidationErrorsChange}
        validationErrors={formValidationErrors?.password}
        label="Password"
        required
      />

      <CustomField
        id="password_confirmation"
        type="password"
        name="password_confirmation"
        dataFormat={dataFormat.password}
        onValidationErrorsChange={handleValidationErrorsChange}
        validationErrors={formValidationErrors?.password_confirmation}
        label="Confirm your password"
        required
      />

      <Field>
        <Button type="submit" disabled={!canSubmit} isLoading={isLoading}>
          Login
        </Button>
      </Field>
    </FieldGroup>
  </form>
}
