// ── Constants ─────────────────────────────────────────────────────────────────

import type { ShippingMethod } from "wle-core";
import formatPrice from "./format-price";

export const CARRIER_LABELS: Record<ShippingMethod['carrier'], string> = {
    custom: 'Custom',
    fedex: 'FedEx',
    colissimo: 'Colissimo',
};

export const CALCULATION_TYPE_LABELS: Record<ShippingMethod['calculation_type'], string> = {
    flat_rate: 'Flat Rate',
    weight_based: 'Weight-Based',
    api: 'Live API',
};

export const CARRIER_OPTIONS: { value: ShippingMethod['carrier']; label: string }[] = [
    { value: 'custom', label: 'Custom' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'colissimo', label: 'Colissimo' },
];

export const CALCULATION_TYPE_OPTIONS: { value: ShippingMethod['calculation_type']; label: string; description: string }[] = [
    { value: 'flat_rate', label: 'Flat Rate', description: 'Fixed cost regardless of weight' },
    { value: 'weight_based', label: 'Weight-Based', description: 'Price scales with package weight' },
    { value: 'api', label: 'Live API', description: 'Real-time rates from carrier API' },
];

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatDeliveryDays(min?: number | null, max?: number | null): string {
    if (!min && !max) return '—';
    if (min && max) return `${min}–${max} days`;
    if (min) return `From ${min} days`;
    return `Up to ${max} days`;
}

export function formatCountries(countries?: string[] | null): string {
    if (!countries || countries.length === 0) return 'Worldwide';
    if (countries.length <= 3) return countries.join(', ');
    return `${countries.slice(0, 3).join(', ')} +${countries.length - 3}`;
}

export function formatWeightRange(min?: number | null, max?: number | null): string {
    if (!min && !max) return 'Any weight';
    if (min && max) return `${min} – ${max} kg`;
    if (min) return `≥ ${min} kg`;
    return `≤ ${max} kg`;
}

export function getMethodCalculationSummary(method: ShippingMethod): string {
    switch (method.calculation_type) {
        case 'flat_rate':
            return method.flat_rate != null ? formatPrice(method.flat_rate) : '—';
        case 'weight_based':
            return method.rate_per_kg != null ? `${formatPrice(method.rate_per_kg)}/kg` : '—';
        case 'api':
            return 'Live pricing';
    }
}

// ── Default form values ───────────────────────────────────────────────────────

export const defaultMethodValues = {
    name: '',
    carrier: 'custom' as ShippingMethod['carrier'],
    is_active: true,
    calculation_type: 'flat_rate' as ShippingMethod['calculation_type'],
    flat_rate: null as number | null,
    free_shipping_threshold: null as number | null,
    rate_per_kg: null as number | null,
    api_config: null as Record<string, any> | null,
    min_delivery_days: null as number | null,
    max_delivery_days: null as number | null,
    allowed_countries: null as string[] | null,
};

export const defaultRateValues = {
    country_code: '*',
    city_pattern: '',
    min_weight_kg: null as number | null,
    max_weight_kg: null as number | null,
    rate: 0,
    rate_per_kg: null as number | null,
};