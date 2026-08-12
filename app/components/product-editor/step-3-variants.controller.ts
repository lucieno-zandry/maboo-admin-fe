import { useEffect, useState } from "react";
import type { DraftVariant, DraftVariantGroup } from "~/types/drafts";

export function useStep3Variants(
    variants: DraftVariant[],
    variantGroups: DraftVariantGroup[]
) {
    const [bulkPrice, setBulkPrice] = useState("");
    const [bulkStock, setBulkStock] = useState("");

    // Build readable label for a variant from its option refs
    const getVariantLabel = (variant: DraftVariant): string => {
        if (!variant.optionRefs.length) return "Default variant";
        return variant.optionRefs
            .map((ref) => {
                const g = variantGroups.find((g) => g.tempId === ref.groupTempId);
                const o = g?.options.find((o) => o.tempId === ref.optionTempId);
                return o?.value ?? "?";
            })
            .join(" / ");
    };

    // Group headers for the table
    const groupNames = variantGroups.map((g) => g.name || "Group");

    // Get the option value for a given variant + group
    const getOptionValue = (variant: DraftVariant, groupTempId: string): string => {
        const ref = variant.optionRefs.find((r) => r.groupTempId === groupTempId);
        if (!ref) return "—";
        const group = variantGroups.find((g) => g.tempId === groupTempId);
        return group?.options.find((o) => o.tempId === ref.optionTempId)?.value ?? "—";
    };

    const [objectUrls, setObjectUrls] = useState<Set<string>>(new Set());

    useEffect(() => {
        return () => {
            objectUrls.forEach(URL.revokeObjectURL);
        };
    }, [objectUrls]);

    // When rendering an image, if it's a File, create URL and add to set.
    // We'll need to be careful to avoid duplicate creation.

    return { getVariantLabel, getOptionValue, groupNames, bulkPrice, setBulkPrice, bulkStock, setBulkStock };
}