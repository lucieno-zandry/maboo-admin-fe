import { redirect, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { Ban, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "wle-ui-package";
import useRouterStore from "~/hooks/use-router-store";
import { getCurrentUserStatus, isUserBlocked } from "~/lib/user-status";
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

        if (user && !isUserBlocked(user))
            return successRedirect();

        return user;

    } catch (error) {
        if (error instanceof HttpException) {
            return redirect(`/${lang}/auth`);
        }
    }

    return null;
}

export default function BlockedPage() {
    const navigate = useNavigate();
    const { lang } = useRouterStore();
    const user = useLoaderData<typeof clientLoader>();

    const status = user ? getCurrentUserStatus(user) : null;

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                    <Ban className="h-12 w-12 text-red-500" />
                    <div className="absolute -right-2 -top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg uppercase tracking-tighter">
                        Blocked
                    </div>
                </div>

                <h1 className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl italic text-foreground">
                    Account Blocked
                </h1>

                <p className="mb-4 text-muted-foreground leading-relaxed">
                    Your account has been blocked by an administrator.
                </p>

                {status?.reason && (
                    <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        <p className="font-semibold">Reason:</p>
                        <p>{status.reason}</p>
                    </div>
                )}

                <p className="mb-8 text-muted-foreground">
                    If you believe this is a mistake, please contact support.
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
                        <ShieldAlert className="h-4 w-4 text-red-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            Account Disabled
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 max-w-[300px]">
                        Contact support:
                        <span className="text-foreground ml-1 font-medium underline underline-offset-4 decoration-red-500/30">
                            {env.SUPPORT_EMAIL}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}