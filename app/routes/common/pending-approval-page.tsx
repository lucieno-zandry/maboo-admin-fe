import { redirect, useNavigate, type LoaderFunctionArgs } from "react-router";
import { Clock, ShieldCheck, LogOut, RefreshCcw } from "lucide-react";
import { Button } from "wle-ui-package"; // Using your custom-ui button
import useRouterStore from "~/hooks/use-router-store";
import { getAuthUser } from "~/api/http-requests";
import { useSuccessRedirect } from "~/hooks/use-redirect-action";
import { HttpException } from "~/api/app-fetch";
import { isUserApproved } from "~/lib/user-status";
import { env } from "~/lib/env";

const successRedirect = useSuccessRedirect();

export async function clientLoader({ params }: LoaderFunctionArgs) {
    const { lang } = params;

    try {
        const authResponse = await getAuthUser();
        const user = authResponse.data?.user;

        if (user && isUserApproved(user))
            return successRedirect();

    } catch (error) {
        if (error instanceof HttpException) {
            return redirect(`/${lang}/auth`);
        }
    }

    return null;
}

export default function ApprovalPendingPage() {
    const navigate = useNavigate();
    const { lang } = useRouterStore();

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 transition-colors duration-300">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">

                {/* Status Icon with Glass Effect */}
                <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                    <Clock className="h-12 w-12 text-indigo-500 animate-pulse" />
                    <div className="absolute -right-2 -top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg uppercase tracking-tighter">
                        Pending
                    </div>
                </div>

                <h1 className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl italic text-foreground">
                    Under Review
                </h1>

                <p className="mb-8 text-muted-foreground leading-relaxed">
                    Your account is currently being reviewed by our team.
                    This usually takes less than 24 hours. We'll notify you
                    as soon as you're ready to go!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Refresh Button to check status */}
                    <Button
                        variant="default"
                        onClick={() => window.location.reload()}
                        className="gap-2 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Check Status
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            // Logout logic would go here
                            navigate(`/${lang}/auth/login`);
                        }}
                        className="gap-2 px-8 rounded-xl border-white/10 hover:bg-white/5"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 w-full">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-indigo-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            Verification in Progress
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 max-w-[300px]">
                        Need urgent access? Contact support at
                        <span className="text-foreground ml-1 font-medium underline underline-offset-4 decoration-indigo-500/30">
                            {env.SUPPORT_EMAIL}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}