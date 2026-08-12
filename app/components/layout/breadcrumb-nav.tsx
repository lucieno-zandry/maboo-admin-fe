// components/ui/breadcrumb-nav.tsx
import React from "react";
import { useLocation, Link } from "react-router";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

// Map route segments to display names
const routeLabels: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    orders: "Orders",
    transactions: "Transactions",
    shipments: "Shipments",
    users: "Users",
    "client-codes": "Client Codes",
    coupons: "Coupons",
    promotions: "Promotions",
    "shipping-methods": "Shipping Methods",
    settings: "Settings",
    account: "Account Settings",
    "pending-approval": "Pending Approval",
    "account-blocked": "Account Blocked",
    "account-suspended": "Account Suspended",
    // Add more as needed
};

// Special patterns for dynamic segments (like UUIDs)
function formatDynamicSegment(segment: string, prevSegment?: string): string {
    // UUID detection (simple regex)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment)) {
        if (prevSegment === "orders") return "Order Details";
        if (prevSegment === "transactions") return "Transaction Details";
        if (prevSegment === "users") return "User Details";
        return segment.slice(0, 8); // short UUID
    }
    // numeric ID
    if (/^\d+$/.test(segment)) {
        if (prevSegment === "users") return `User #${segment}`;
        return `ID ${segment}`;
    }
    return segment;
}

export default function BreadcrumbNav() {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Remove the language prefix (first segment)
    const lang = pathSegments[0];
    const segmentsWithoutLang = pathSegments.slice(1);

    // Build breadcrumb items
    const breadcrumbs = [];
    let accumulatedPath = `/${lang}`;

    for (let i = 0; i < segmentsWithoutLang.length; i++) {
        const segment = segmentsWithoutLang[i];
        const prevSegment = segmentsWithoutLang[i - 1];
        accumulatedPath += `/${segment}`;
        const isLast = i === segmentsWithoutLang.length - 1;

        let label = routeLabels[segment] || formatDynamicSegment(segment, prevSegment);
        // Capitalize first letter if not found
        if (!routeLabels[segment] && !/^[A-Z]/.test(label)) {
            label = label.charAt(0).toUpperCase() + label.slice(1);
        }

        breadcrumbs.push({
            label,
            path: accumulatedPath,
            isLast,
        });
    }

    // If no breadcrumbs, show "Dashboard"
    if (breadcrumbs.length === 0) {
        breadcrumbs.push({ label: "Dashboard", path: `/${lang}/dashboard`, isLast: true });
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.path}>
                        <BreadcrumbItem>
                            {crumb.isLast ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={crumb.path}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!crumb.isLast && <BreadcrumbSeparator key={`sep-${idx}`} />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}