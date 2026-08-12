import { useMemo } from "react";
import type { Variant, VariantGroup } from "wle-core";

export function useVariantsTable(variants: Variant[], variantGroups: VariantGroup[]) {
    // Build a map of group id → group name
    const groupNameById = useMemo(() => {
        const map = new Map<number, string>();
        variantGroups.forEach((g) => map.set(g.id, g.name));
        return map;
    }, [variantGroups]);

    // For each variant, extract its option values keyed by group name
    const rows = useMemo(() => {
        return variants.map((v) => {
            const optionsByGroup: Record<string, string> = {};
            v.variant_options?.forEach((opt) => {
                const groupName = groupNameById.get(opt.variant_group_id) ?? "Group";
                optionsByGroup[groupName] = opt.value;
            });
            return { variant: v, optionsByGroup };
        });
    }, [variants, groupNameById]);

    const groupNames = useMemo(
        () => variantGroups.map((g) => g.name),
        [variantGroups]
    );

    const totalStock = useMemo(
        () => variants.reduce((sum, v) => sum + v.stock, 0),
        [variants]
    );

    return { rows, groupNames, totalStock };
}