import { useRef, useState } from "react";
import getInitials from "~/lib/get-initials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Camera, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { Button } from "wle-ui-package";
import { useAuthStore } from "~/hooks/use-auth-store";// adjust import path as needed
import { toast } from "sonner"; // or your toast library
import { updateAuthUser } from "~/api/http-requests";
import { ValidationException } from "~/api/app-fetch";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

export default function AccountCard() {
    const user = useAuthStore((state) => state.user!);
    const setUser = useAuthStore((state) => state.setUser);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { t } = useTranslation("settings");

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error(t('settings:pleaseSelectImage'));
            return;
        }

        // Validate file size (e.g., 5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('settings:imageSizeLimit'));
            return;
        }

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar_image', file);

            const response = await updateAuthUser(formData);
            // Update user store
            setUser(response.data!.user);

            toast.success(t('settings:profilePhotoUpdated'));
            setPreviewUrl(null);
        } catch (error) {
            if (error instanceof ValidationException) {
                toast.error(`${error.errors.avatar_image?.[0] || t('settings:invalidImageFile')}`);
            }

            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const currentAvatarUrl = previewUrl || user.avatar_image?.url || undefined;

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-6 space-y-0 p-6">
                {/* Avatar with hover effect */}
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-border transition-all group-hover:border-primary/50">
                        <AvatarImage
                            src={currentAvatarUrl}
                            className={cn("object-cover", isUploading && "opacity-50")}
                        />
                        <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/10 to-primary/5">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Loading overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                    )}

                    {/* Hover overlay */}
                    {!isUploading && (
                        <button
                            onClick={handlePhotoClick}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </button>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {user.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2 text-base">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                        {user.email_verified_at && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                    </CardDescription>
                </div>

                {/* Change Photo Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePhotoClick}
                    disabled={isUploading}
                    className="hidden sm:flex items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('settings:uploading')}
                        </>
                    ) : (
                        <>
                            <Camera className="h-4 w-4" />
                            {t('settings:changePhoto')}
                        </>
                    )}
                </Button>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
            </CardHeader>
        </Card>
    );
}