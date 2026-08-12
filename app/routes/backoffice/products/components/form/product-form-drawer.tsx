import { toast } from "sonner";
import { useProductFormStore } from "../../stores/use-product-form-store";
import { createFullProduct, updateFullProduct } from "~/api/http-requests";
import type { ProductFormStep } from "../../types/product-form-types";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { buildCreateFormData, buildUpdateFormData } from "../../helpers/form-to-formdata";
import { ProductMetaStep } from "./product-meta-step";
import { VariantGroupsStep } from "./variant-groups-step";
import { VariantsStep } from "./variants-step";
import { ProductFormDrawerView } from "./product-form-drawer-view";
import { useCategoryStore } from "~/hooks/use-category-store";
import type { Product } from "wle-core";


/**
 * Smart root: orchestrates API calls, error mapping, step navigation.
 * Renders no markup itself — delegates to ProductFormDrawerView.
 *
 * Usage:
 *   const store = useProductFormStore();
 *   <ProductFormDrawer onSuccess={(product) => refetch()} />
 *   // open it from anywhere via:
 *   store.openForCreate()
 *   store.openForEdit(product)
 */
type Props = {
    onSuccess?: (product: Product) => void;
};

export function ProductFormDrawer({ onSuccess }: Props) {
    const store = useProductFormStore();
    const {
        open,
        step,
        editingProductId,
        title,
        slug,
        description,
        category_id,
        images,
        variant_groups,
        variants,
        globalError,
        submitting,
        close,
        setStep,
        setFieldErrors,
        setGlobalError,
        clearErrors,
        setSubmitting,
    } = store;

    const { categories } = useCategoryStore();

    // ── step validation (client-side quick checks) ────────────────────────────
    function validateStep(s: ProductFormStep): boolean {
        clearErrors();

        if (s === 1) {
            const errors: Record<string, string[]> = {};
            if (!title.trim()) errors["title"] = ["Title is required."];
            if (!slug.trim()) errors["slug"] = ["Slug is required."];
            if (Object.keys(errors).length) {
                setFieldErrors(errors);
                return false;
            }
        }

        if (s === 2) {
            const errors: Record<string, string[]> = {};
            variant_groups.forEach((g, gi) => {
                if (!g.name.trim()) {
                    errors[`variant_groups.${gi}.name`] = ["Group name is required."] as any;
                }
                g.options.forEach((o, oi) => {
                    if (!o.value.trim()) {
                        errors[`variant_groups.${gi}.options.${oi}.value`] = ["Option value is required."] as any;
                    }
                });
            });
            if (Object.keys(errors).length) {
                setFieldErrors(errors);
                return false;
            }
        }

        return true;
    }

    function handleNext() {
        if (!validateStep(step)) return;
        setStep((step + 1) as ProductFormStep);
    }

    function handleBack() {
        clearErrors();
        setStep((step - 1) as ProductFormStep);
    }

    function handleStepNavigate(target: number) {
        if (target >= step) return; // can only go back
        clearErrors();
        setStep(target as ProductFormStep);
    }

    // ── server error mapping ──────────────────────────────────────────────────
    function handleServerError(err: unknown) {
        if (err instanceof ValidationException) {
            // Flatten Laravel dot-notation errors into the store
            setFieldErrors(err.errors as Record<string, string[]>);
            // If step-1 fields are in error, jump back
            const errorKeys = Object.keys(err.errors);
            const hasStep1Error = errorKeys.some((k) =>
                ["title", "slug", "description", "category_id", "images"].some((f) => k.startsWith(f))
            );
            const hasStep2Error = errorKeys.some((k) => k.startsWith("variant_groups"));
            if (hasStep1Error) setStep(1);
            else if (hasStep2Error) setStep(2);
            setGlobalError("Please fix the highlighted fields.");
        } else if (err instanceof HttpException) {
            setGlobalError(
                err.data?.message ?? `Server error (${err.status}). Please try again.`
            );
        } else {
            setGlobalError("An unexpected error occurred. Please try again.");
        }
    }

    // ── submit ────────────────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!validateStep(3)) return;

        setSubmitting(true);
        clearErrors();

        try {
            const existingImageIds = images.filter((i) => i.id).map((i) => i.id!);

            let result: { data?: { product: Product }; error?: any; status: number };

            if (editingProductId) {
                const fd = buildUpdateFormData({
                    title,
                    slug,
                    description,
                    category_id,
                    images,
                    variant_groups,
                    variants,
                    existingImageIds,
                });
                result = await updateFullProduct(editingProductId, fd);
            } else {
                const fd = buildCreateFormData({
                    title,
                    slug,
                    description,
                    category_id,
                    images,
                    variant_groups,
                    variants,
                });
                result = await createFullProduct(fd);
            }

            if (result.error) {
                handleServerError(result.error);
                return;
            }

            const product = result.data?.product;
            if (!product) {
                setGlobalError("Unexpected response from server.");
                return;
            }

            toast.success(
                editingProductId
                    ? `"${product.title}" updated successfully.`
                    : `"${product.title}" created successfully.`
            );
            close();
            onSuccess?.(product);
        } catch (err) {
            handleServerError(err);
        } finally {
            setSubmitting(false);
        }
    }

    // ── render ────────────────────────────────────────────────────────────────
    const stepContent: Record<ProductFormStep, React.ReactNode> = {
        1: <ProductMetaStep categories={categories} />,
        2: <VariantGroupsStep />,
        3: <VariantsStep />,
    };

    return (
        <ProductFormDrawerView
            open={open}
            isEditMode={!!editingProductId}
            step={step}
            globalError={globalError}
            submitting={submitting}
            onClose={close}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            onStepNavigate={handleStepNavigate}
        >
            {stepContent[step as keyof typeof stepContent]}
        </ProductFormDrawerView>
    );
}