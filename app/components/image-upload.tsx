import React, { useId } from "react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Image as ImageIcon, X } from "lucide-react";

export interface ImageUploadProps {
    /** Optional custom ID for input label pairing. Automatically generated if omitted. */
    id?: string;
    /** Primary label text */
    label?: string;
    /** Subtitle/hint text inside the top label */
    optionalText?: string;
    /** URL or base64 string for the image preview */
    previewUrl?: string | null;
    /** Error message to display under the input */
    error?: string;
    /** Accepted file types string for input element */
    accept?: string;
    /** File restriction text shown inside drop zone */
    maxSizeText?: string;
    /** Callback fired when a file is selected or dropped */
    onFileChange: (file: File | null) => void;
    /** Callback fired when the remove button is clicked */
    onRemoveImage: () => void;
    /** Additional container class names */
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    id,
    label = "Image",
    optionalText = "(optional, supports drag & drop)",
    previewUrl,
    error,
    accept = "image/jpeg,image/png,image/jpg,image/gif,image/webp",
    maxSizeText = "JPG, PNG, GIF, WebP up to 2MB",
    onFileChange,
    onRemoveImage,
    className,
}) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileChange(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className={`space-y-1.5 ${className || ""}`}>
            {label && (
                <Label htmlFor={inputId} className="text-xs font-medium">
                    {label}
                    {optionalText && (
                        <span className="text-muted-foreground ml-1">
                            {optionalText}
                        </span>
                    )}
                </Label>
            )}

            <div className="flex flex-col gap-3">
                {previewUrl ? (
                    <div className="relative w-full max-w-[200px]">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="rounded-md border object-cover w-full h-auto aspect-square"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={onRemoveImage}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ) : (
                    <label
                        htmlFor={inputId}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-muted/20 hover:bg-muted/40 transition"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                Click or drag & drop
                            </span>
                            {maxSizeText && (
                                <span className="text-[10px] text-muted-foreground">
                                    {maxSizeText}
                                </span>
                            )}
                        </div>
                        <Input
                            id={inputId}
                            type="file"
                            accept={accept}
                            className="hidden"
                            onChange={(e) =>
                                onFileChange(e.target.files?.[0] ?? null)
                            }
                        />
                    </label>
                )}
            </div>

            {error && (
                <p className="text-xs text-destructive">{error}</p>
            )}
        </div>
    );
};