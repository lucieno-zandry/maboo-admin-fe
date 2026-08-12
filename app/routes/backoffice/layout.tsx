import { Outlet, redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Header from "~/components/layout/header";
import Sidebar from "~/components/layout/sidebar";
import backgroundImage from "~/assets/images/backround-image.jpg";
import { useAuthStore } from "~/hooks/use-auth-store";
import { HttpException } from "~/api/app-fetch";
import redirectPathnames from "~/lib/redirect-pathnames";
import BackofficeSkeleton from "~/components/layout/backoffice-skeleton";
import { getCurrentUserStatus } from "~/lib/user-status";
import { useSettingsStore } from "./settings/stores/use-settings-store";
import { useEffect } from "react";
import { useCategoryStore } from "~/hooks/use-category-store";

export function HydrateFallback() {
    return <BackofficeSkeleton />
}

export async function clientLoader({ params }: LoaderFunctionArgs) {
    const lang = params.lang || "en";

    const { fetchSettings } = useSettingsStore.getState();
    const { fetchAuth } = useAuthStore.getState();

    try {
        const [user] = await Promise.all([
            fetchAuth(),
            fetchSettings()
        ]);
        
        if (user?.role !== "admin") throw new HttpException(403);
        if (!user?.email_verified_at)
            throw new HttpException(403, { action: "VERIFY_EMAIL" });

        // Check user status
        const status = getCurrentUserStatus(user);

        if (!status || status.status !== "approved") {
            // Redirect to the appropriate status page
            let statusPath = "pending-approval";
            if (status?.status === "blocked") statusPath = "account-blocked";
            else if (status?.status === "suspended") statusPath = "account-suspended";
            return redirect(`/${lang}/${statusPath}`);
        }

        return;
    } catch (error) {
        if (error instanceof HttpException) {
            if (error.status === 401) {
                return redirect(`/${lang}/auth`);
            } else if (error.status === 403 && !error.data) {
                return redirect(`/${lang}/403`);
            } else if (error.status === 403 && error.data?.action) {
                const redirectPathname =
                    redirectPathnames[
                    error.data.action as keyof typeof redirectPathnames
                    ];
                return redirect(`/${lang}/${redirectPathname}`);
            }
        }
    }

    return redirect(`/${lang}/500`);
}

export default function AdminLayout() {
    const { fetchCategories } = useCategoryStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="h-screen flex overflow-hidden p-2 gap-2" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            {/* Sidebar now lives "inside" the flex flow on desktop */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Header />
                <main className="overflow-hidden  pb-5 h-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}