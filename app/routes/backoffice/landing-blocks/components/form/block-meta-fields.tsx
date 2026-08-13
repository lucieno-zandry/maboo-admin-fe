import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { useEffect, useState } from 'react';
import type { LandingBlockFormData } from '../../types/landing-block-form-types';
import { useLandingBlockFormStore } from '../../stores/use-landing-block-form-store';
import { BlockContentEditor } from './block-content-editors/block-content-editor';
import { ImageUpload } from '~/components/image-upload';

// ── Dumb View ─────────────────────────────────────────────────────────────────

type BlockMetaFieldsViewProps = {
    formData: LandingBlockFormData;
    errors: Record<string, string>;
    mode: 'create' | 'edit';

    previewUrl: string | null;

    onChange: (field: keyof LandingBlockFormData, value: any) => void;
    onFileChange: (file: File | null) => void;
    onRemoveImage: () => void;
};

export function BlockMetaFieldsView({
    formData,
    errors,
    mode,
    previewUrl,
    onChange,
    onFileChange,
    onRemoveImage,
}: BlockMetaFieldsViewProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold mb-0.5">Block details</h3>
                <p className="text-xs text-muted-foreground">
                    Configure the content and visibility.
                </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="block-title" className="text-xs font-medium">
                    Title
                </Label>
                <Input
                    id="block-title"
                    value={formData.title}
                    onChange={(e) => onChange('title', e.target.value)}
                    placeholder="e.g., Summer Collection"
                    className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                    <p className="text-xs text-destructive">{errors.title}</p>
                )}
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
                <Label htmlFor="block-subtitle" className="text-xs font-medium">
                    Subtitle
                    <span className="text-muted-foreground ml-1">(optional)</span>
                </Label>
                <Input
                    id="block-subtitle"
                    value={formData.subtitle}
                    onChange={(e) => onChange('subtitle', e.target.value)}
                    placeholder="e.g., Discover our latest arrivals"
                />
            </div>

            {/* Image Upload */}
            <ImageUpload
                previewUrl={previewUrl}
                error={errors.image}
                onFileChange={onFileChange}
                onRemoveImage={onRemoveImage}
            />

            {formData.block_type && (
                <div className="space-y-1.5 pt-2 border-t">
                    <Label className="text-xs font-medium">Block‑specific content</Label>
                    <BlockContentEditor
                        blockType={formData.block_type}
                        value={formData.content}
                        onChange={(newContent) => onChange('content', newContent)}
                    />
                </div>
            )}

            {/* Display Order */}
            <div className="space-y-1.5">
                <Label htmlFor="block-order" className="text-xs font-medium">
                    Display order
                </Label>
                <Input
                    id="block-order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                        onChange('display_order', Number(e.target.value))
                    }
                    min={0}
                />
                <p className="text-xs text-muted-foreground">
                    Lower numbers appear first. You can also drag to reorder.
                </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
                <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">
                        Inactive blocks are hidden from the storefront
                    </p>
                </div>
                <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                        onChange('is_active', checked)
                    }
                />
            </div>
        </div>
    );
}

// ── Smart Component ───────────────────────────────────────────────────────────

type BlockMetaFieldsProps = {
    errors?: Record<string, string>;
};

export function BlockMetaFields({ errors = {} }: BlockMetaFieldsProps) {
    const { formData, setFormData, mode, editingBlock } =
        useLandingBlockFormStore();

    const [preview, setPreview] = useState<string | null>(null);

    const existingImageUrl = editingBlock?.image?.url ?? null;

    useEffect(() => {
        if (existingImageUrl)
            setPreview(existingImageUrl);
    }, []);

    // Handle preview generation
    useEffect(() => {
        if (!formData.image) return;

        const url = URL.createObjectURL(formData.image);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [formData.image]);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        setFormData({ image: file });

        // Reset remove flag if uploading new image
        if (formData.remove_image) {
            setFormData({ remove_image: false });
        }
    };

    const handleRemoveImage = () => {
        setFormData({ image: null });
        setPreview(null);

        if (mode === 'edit') {
            setFormData({ remove_image: true });
        }
    };


    return (
        <BlockMetaFieldsView
            formData={formData}
            errors={errors}
            mode={mode}
            previewUrl={preview}
            onChange={(field, value) =>
                setFormData({ [field]: value })
            }
            onFileChange={handleFileChange}
            onRemoveImage={handleRemoveImage}
        />
    );
}