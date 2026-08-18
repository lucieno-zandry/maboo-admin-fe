import * as React from "react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "~/components/ui/input-otp";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Form, useNavigation } from "react-router";
import { Mail } from "lucide-react";
import { Button } from "wle-ui-package";

export type EmailVerificationOtpProps = {
    onSendEmailVerificationCode: () => void,
    errorMessages: string[] | null,
}

const RESEND_TIMEOUT = 30;

export function EmailVerificationOtp({
    onSendEmailVerificationCode,
    errorMessages
}: EmailVerificationOtpProps) {
    const [otp, setOtp] = React.useState("");
    const codeLength = 6;

    const [secondsLeft, setSecondsLeft] = React.useState(RESEND_TIMEOUT);
    const [canResend, setCanResend] = React.useState(false);

    const navigation = useNavigation();
    const isLoading = React.useMemo(() => navigation.state === "submitting", [navigation.state]);

    // countdown effect
    React.useEffect(() => {
        if (secondsLeft === 0) {
            setCanResend(true);
            return;
        }

        const timer = setTimeout(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const handleResend = () => {
        onSendEmailVerificationCode();
        setCanResend(false);
        setSecondsLeft(RESEND_TIMEOUT);
    };

    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold flex justify-center items-center gap-2">
                    <Mail /> Verify Your Email
                </CardTitle>
                <CardDescription>
                    We've sent a {codeLength}-digit verification code to your email address.
                    Please enter it below to confirm your account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form className="space-y-6" method="post">
                    <div className="flex flex-col items-center gap-3">
                        <InputOTP
                            maxLength={codeLength}
                            value={otp}
                            onChange={setOtp}
                            name="otp">
                            <InputOTPGroup>
                                {Array.from({ length: codeLength }).map((_, index) => (
                                    <InputOTPSlot key={index} index={index} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>

                        {errorMessages && <p className="text-destructive text-sm">
                            {errorMessages}
                        </p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={otp.length !== codeLength}
                        isLoading={isLoading}>
                        Verify Account
                    </Button>
                </Form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Didn't receive the code?
                    {canResend ? (
                        <Button
                            variant="link"
                            onClick={handleResend}
                            className="p-1 h-auto"
                        >
                            Resend Code
                        </Button>
                    ) : (
                        <span className="ml-1">
                            Resend available in {secondsLeft}s
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
