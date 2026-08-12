import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { StoryStat } from "wle-core";

interface Props {
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
}

export function StoryContentEditor({ value, onChange }: Props) {
    const eyebrow = value.eyebrow ?? "";
    const body = value.body ?? "";
    const imageCaption = value.imageCaption ?? "";
    const stats: StoryStat[] = value.stats ?? [];

    const updateField = (field: string, val: string) => {
        onChange({ ...value, [field]: val, stats });
    };

    const updateStats = (newStats: StoryStat[]) => {
        onChange({ ...value, stats: newStats, eyebrow, body, imageCaption });
    };

    const addStat = () => {
        updateStats([...stats, { value: "", label: "" }]);
    };

    const removeStat = (index: number) => {
        const updated = [...stats];
        updated.splice(index, 1);
        updateStats(updated);
    };

    const updateStat = (index: number, field: keyof StoryStat, val: string) => {
        const updated = [...stats];
        updated[index] = { ...updated[index], [field]: val };
        updateStats(updated);
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <div>
                <Label className="text-xs font-medium">Eyebrow (optional)</Label>
                <Input
                    value={eyebrow}
                    onChange={(e) => updateField("eyebrow", e.target.value)}
                    placeholder="e.g., Our story"
                />
            </div>

            <div>
                <Label className="text-xs font-medium">Body text</Label>
                <Textarea
                    value={body}
                    onChange={(e) => updateField("body", e.target.value)}
                    placeholder="The story of your brand..."
                    rows={6}
                />
            </div>

            <div>
                <Label className="text-xs font-medium">Image caption (optional)</Label>
                <Input
                    value={imageCaption}
                    onChange={(e) => updateField("imageCaption", e.target.value)}
                    placeholder="e.g., The SAVA region of Madagascar"
                />
            </div>

            <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Statistic pills</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addStat}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add stat
                    </Button>
                </div>

                {stats.map((stat, idx) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-2 mb-2 bg-background">
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Stat {idx + 1}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 text-destructive"
                                onClick={() => removeStat(idx)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Value</Label>
                                <Input
                                    value={stat.value}
                                    onChange={(e) => updateStat(idx, "value", e.target.value)}
                                    placeholder="e.g., 2018"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Label</Label>
                                <Input
                                    value={stat.label}
                                    onChange={(e) => updateStat(idx, "label", e.target.value)}
                                    placeholder="e.g., First Partnership"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {stats.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                        No stats. Click "Add stat" to start.
                    </p>
                )}
            </div>
        </div>
    );
}