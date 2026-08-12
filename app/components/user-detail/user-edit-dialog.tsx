import { useMemo, useState, type FocusEvent, type SubmitEventHandler } from "react";
import CustomField from "~/components/custom-ui/field";
import { FieldGroup } from "~/components/ui/field";
import Button from "~/components/custom-ui/button";
import z from "zod";
import getUpdatedFormErrors from "~/lib/get-updated-form-errors";
import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { useUsersStore } from "~/hooks/use-users-store";
import { updateUser } from "~/api/http-requests";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "../ui/dialog";
import { ValidationException } from "~/api/app-fetch";
import type { User } from "wle-core";

const dataFormat = {
    name: z.string().min(1, "Name is required"),
    email: z.email(),
    role: z.enum(["admin", "manager", "client"]),
    client_code_id: z.string().optional(),
    password: z.string().min(6).optional().or(z.literal("")),
    password_confirmation: z.string().optional(),
};

type Props = {
    defaultValues: {
        name: string;
        email: string;
        role: User['role'];
        client_code_id?: number;
        password?: string;
        password_confirmation?: string;
    };
    handleSubmit: SubmitEventHandler<HTMLFormElement>;
    onCancel: () => void;
    isSubmitting: boolean;
    formValidationErrors: (Record<string, string[] | null>) | null,
    onValidationErrorsChange: ((validationErrors: string[] | null, e: FocusEvent<HTMLInputElement, Element>) => void),
    canSubmit: boolean,
};

export function UserEditForm({
    defaultValues,
    handleSubmit,
    onCancel,
    isSubmitting,
    formValidationErrors,
    onValidationErrorsChange,
    canSubmit
}: Props) {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
            <FieldGroup className="space-y-6">

                {/* Section 1: Personal Information */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                        Personal Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CustomField
                            label="Name"
                            name="name"
                            defaultValue={defaultValues.name}
                            dataFormat={dataFormat.name}
                            validationErrors={formValidationErrors?.name}
                            onValidationErrorsChange={onValidationErrorsChange}
                            required
                        />

                        <CustomField
                            label="Email"
                            name="email"
                            type="email"
                            defaultValue={defaultValues.email}
                            dataFormat={dataFormat.email}
                            validationErrors={formValidationErrors?.email}
                            onValidationErrorsChange={onValidationErrorsChange}
                            required
                        />
                    </div>
                </div>

                {/* Section 2: Access & Permissions */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                        Access & Permissions
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CustomField
                            label="Role"
                            name="role"
                            defaultValue={defaultValues.role}
                            dataFormat={dataFormat.role}
                            validationErrors={formValidationErrors?.role}
                            onValidationErrorsChange={onValidationErrorsChange}
                            required
                        />

                        <CustomField
                            label="Client Code (ID)"
                            name="client_code_id"
                            defaultValue={defaultValues.client_code_id}
                            dataFormat={dataFormat.client_code_id}
                            validationErrors={formValidationErrors?.client_code_id}
                            onValidationErrorsChange={onValidationErrorsChange}
                        />
                    </div>
                </div>

                {/* Section 3: Security */}
                <div className="space-y-3">
                    <div className="flex flex-col border-b pb-1">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            Security
                        </h4>
                        <p className="text-[0.8rem] text-muted-foreground/70">
                            Leave blank to keep the current password.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CustomField
                            label="New Password"
                            name="password"
                            type="password"
                            defaultValue=""
                            dataFormat={dataFormat.password}
                            validationErrors={formValidationErrors?.password}
                            onValidationErrorsChange={onValidationErrorsChange}
                        />

                        <CustomField
                            label="Confirm Password"
                            name="password_confirmation"
                            type="password"
                            defaultValue=""
                            dataFormat={dataFormat.password_confirmation}
                            validationErrors={formValidationErrors?.password_confirmation}
                            onValidationErrorsChange={onValidationErrorsChange}
                        />
                    </div>
                </div>

            </FieldGroup>

            <DialogFooter className="pt-4 mt-2 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    isLoading={isSubmitting}
                >
                    Save Changes
                </Button>
            </DialogFooter>
        </form>
    );
}

interface UserEditDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
    const { fetchUser } = useUserDetailStore();
    const { fetchUsers } = useUsersStore();

    const [formValidationErrors, setFormValidationErrors] = useState<{
        name?: string[];
        email?: string[];
        role?: string[];
        client_code_id?: string[];
        password?: string[];
        password_confirmation?: string[];
    } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = {
        name: user.name,
        email: user.email,
        role: user.role,
        client_code_id: user.client_code_id,
        password: "",
        password_confirmation: "",
    };

    const canSubmit = useMemo(() => !formValidationErrors, [formValidationErrors]);

    const handleValidationChange = (
        validationErrors: string[] | null,
        e: FocusEvent<HTMLInputElement>
    ) => {
        const updated = getUpdatedFormErrors({
            formErrors: formValidationErrors,
            name: e.target.name as keyof typeof dataFormat,
            validationErrors,
        });

        setFormValidationErrors(updated);
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        const formData = new FormData(e.currentTarget);

        const clientCodeIdString = formData.get("client_code_id")?.toString();
        const clientCodeId = clientCodeIdString ? parseInt(clientCodeIdString) : null;

        const values = {
            name: formData.get("name")?.toString() || null,
            email: formData.get("email")?.toString() || null,
            role: formData.get("role")?.toString() || null,
            client_code_id: clientCodeId,
            password: formData.get("password")?.toString() || null,
            password_confirmation: formData.get("password_confirmation")?.toString() || null,
        };

        // custom password match validation
        if (values.password !== values.password_confirmation) {
            setFormValidationErrors({
                ...formValidationErrors,
                password_confirmation: ["Passwords don't match"],
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: values.name,
                email: values.email,
                role: values.role,
                client_code_id: values.client_code_id,
                password: values.password || undefined,
                password_confirmation: values.password_confirmation || undefined,
            };

            await updateUser(user.id, payload);
            onOpenChange(false);
            toast.success("User updated successfully");

            // Refresh data
            await fetchUser(user.id);
            await fetchUsers();

        } catch (error) {
            toast.error("Failed to update user");
            console.error(error);

            if (error instanceof ValidationException) {
                setFormValidationErrors(error.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Widened the max-width to accommodate the 2-column grid naturally */}
            <DialogContent className="sm:max-w-[600px] max-h-[90%] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Make changes to the user's profile. Click save when finished.
                    </DialogDescription>
                </DialogHeader>

                <UserEditForm
                    defaultValues={defaultValues}
                    handleSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                    canSubmit={canSubmit}
                    formValidationErrors={formValidationErrors}
                    onValidationErrorsChange={handleValidationChange}
                />
            </DialogContent>
        </Dialog>
    );
}