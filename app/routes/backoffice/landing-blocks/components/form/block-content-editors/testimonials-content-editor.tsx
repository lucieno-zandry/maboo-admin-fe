import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Plus, Trash2, GripVertical, Star } from "lucide-react";
import type { Testimonial } from "wle-core";

interface Props {
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
}

export function TestimonialsContentEditor({ value, onChange }: Props) {
    const eyebrow = value.eyebrow ?? "";
    const testimonials: Testimonial[] = value.testimonials ?? [];

    const updateEyebrow = (val: string) => {
        onChange({ ...value, eyebrow: val, testimonials });
    };

    const updateTestimonials = (newTestimonials: Testimonial[]) => {
        onChange({ ...value, testimonials: newTestimonials, eyebrow });
    };

    const addTestimonial = () => {
        const newId = crypto.randomUUID();
        updateTestimonials([
            ...testimonials,
            {
                id: newId,
                author: "",
                location: "",
                avatar: "",
                rating: 5,
                text: "",
                verified: false,
            },
        ]);
    };

    const removeTestimonial = (index: number) => {
        const updated = [...testimonials];
        updated.splice(index, 1);
        updateTestimonials(updated);
    };

    const updateTestimonial = (index: number, field: keyof Testimonial, val: any) => {
        const updated = [...testimonials];
        updated[index] = { ...updated[index], [field]: val };
        updateTestimonials(updated);
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <div>
                <Label className="text-xs font-medium">Eyebrow (optional)</Label>
                <Input
                    value={eyebrow}
                    onChange={(e) => updateEyebrow(e.target.value)}
                    placeholder="e.g., What our customers say"
                />
            </div>

            <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Testimonials</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addTestimonial}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add testimonial
                    </Button>
                </div>

                {testimonials.map((item, idx) => (
                    <div key={item.id} className="border rounded-lg p-3 space-y-2 mb-2 bg-background">
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Testimonial {idx + 1}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 text-destructive"
                                onClick={() => removeTestimonial(idx)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div>
                            <Label className="text-xs">Author name</Label>
                            <Input
                                value={item.author}
                                onChange={(e) => updateTestimonial(idx, "author", e.target.value)}
                                placeholder="e.g., Marie Dupont"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Location</Label>
                            <Input
                                value={item.location}
                                onChange={(e) => updateTestimonial(idx, "location", e.target.value)}
                                placeholder="e.g., Paris, France"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Avatar URL (optional)</Label>
                            <Input
                                value={item.avatar ?? ""}
                                onChange={(e) => updateTestimonial(idx, "avatar", e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Rating (1-5)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={item.rating}
                                    onChange={(e) => updateTestimonial(idx, "rating", parseInt(e.target.value))}
                                    className="w-20"
                                />
                                <div className="flex">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < item.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs">Testimonial text</Label>
                            <Textarea
                                value={item.text}
                                onChange={(e) => updateTestimonial(idx, "text", e.target.value)}
                                placeholder="The product is amazing..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Verified purchase</Label>
                            <Switch
                                checked={item.verified}
                                onCheckedChange={(checked) => updateTestimonial(idx, "verified", checked)}
                            />
                        </div>
                    </div>
                ))}

                {testimonials.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                        No testimonials yet. Click "Add testimonial" to start.
                    </p>
                )}
            </div>
        </div>
    );
}