import { redirect, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { Clock, LogOut, ShieldAlert, Calendar } from "lucide-react";
import { Button } from "wle-ui-package";
import useRouterStore from "~/hooks/use-router-store";
import { useAuthStore } from "~/hooks/use-auth-store";
import { getCurrentUserStatus, isUserSuspended } from "~/lib/user-status";
import { useSuccessRedirect } from "~/hooks/use-redirect-action";
import { getAuthUser } from "~/api/http-requests";
import { HttpException } from "~/api/app-fetch";
import { env } from "~/lib/env";

const successRedirect = useSuccessRedirect();

export async function clientLoader({ params }: LoaderFunctionArgs) {
    const { lang } = params;

    try {
        const authResponse = await getAuthUser();
        const user = authResponse.data?.user;

        if (user && !isUserSuspended(user))
            return successRedirect();

        return user;

    } catch (error) {
        if (error instanceof HttpException) {
            return redirect(`/${lang}/auth`);
        }
    }

    return null;
}


export default function SuspendedPage() {
    const navigate = useNavigate();
    const { lang } = useRouterStore();

    const user = useLoaderData<typeof clientLoader>();
    const status = user ? getCurrentUserStatus(user) : null;
    const expiresAt = status?.expires_at ? new Date(status.expires_at) : null;

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                    <Clock className="h-12 w-12 text-amber-500" />
                    <div className="absolute -right-2 -top-2 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg uppercase tracking-tighter">
                        Suspended
                    </div>
                </div>

                <h1 className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl italic text-foreground">
                    Account Suspended
                </h1>

                <p className="mb-4 text-muted-foreground leading-relaxed">
                    Your account has been temporarily suspended.
                </p>

                {status?.reason && (
                    <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
                        <p className="font-semibold">Reason:</p>
                        <p>{status.reason}</p>
                    </div>
                )}

                {expiresAt && expiresAt > new Date() && (
                    <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
                        <Calendar className="h-4 w-4" />
                        <span>Expected to be lifted on {expiresAt.toLocaleDateString()}</span>
                    </div>
                )}

                <p className="mb-8 text-muted-foreground">
                    If you have questions, please contact support.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/${lang}/auth/login`)}
                        className="gap-2 px-8 rounded-xl border-white/10 hover:bg-white/5"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 w-full">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldAlert className="h-4 w-4 text-amber-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            Temporary Restriction
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 max-w-[300px]">
                        Need assistance? Contact support at
                        <span className="text-foreground ml-1 font-medium underline underline-offset-4 decoration-amber-500/30">
                            {env.SUPPORT_EMAIL}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}