import type { Address } from "wle-core";

export function formatFullAddress(addr: Address): string {
    const parts = [addr.line1];
    if (addr.line2) parts.push(addr.line2);
    parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    parts.push(addr.postal_code);
    parts.push(addr.country);
    return parts.filter(Boolean).join(", ");
}