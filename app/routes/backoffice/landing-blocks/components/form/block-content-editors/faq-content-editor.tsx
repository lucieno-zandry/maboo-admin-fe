import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { FaqItem } from "wle-core";

interface Props {
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
}

export function FaqContentEditor({ value, onChange }: Props) {
    const items: FaqItem[] = value.items ?? [];
    const eyebrow = value.eyebrow ?? "";

    const updateMeta = (field: string, val: string) => {
        onChange({ ...value, [field]: val, items });
    };

    const updateItems = (newItems: FaqItem[]) => {
        onChange({ ...value, items: newItems, eyebrow });
    };

    const addItem = () => {
        const newId = crypto.randomUUID();
        updateItems([...items, { id: newId, question: "", answer: "" }]);
    };

    const removeItem = (index: number) => {
        const updated = [...items];
        updated.splice(index, 1);
        updateItems(updated);
    };

    const updateItem = (index: number, field: keyof FaqItem, val: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: val };
        updateItems(updated);
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <div>
                <Label className="text-xs font-medium">Eyebrow (optional)</Label>
                <Input
                    value={eyebrow}
                    onChange={(e) => updateMeta("eyebrow", e.target.value)}
                    placeholder="e.g., Got questions?"
                />
            </div>

            <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">FAQ items</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addItem}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add question
                    </Button>
                </div>

                {items.map((item, idx) => (
                    <div key={item.id} className="border rounded-lg p-3 space-y-2 mb-2 bg-background">
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Question {idx + 1}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 text-destructive"
                                onClick={() => removeItem(idx)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div>
                            <Label className="text-xs">Question</Label>
                            <Input
                                value={item.question}
                                onChange={(e) => updateItem(idx, "question", e.target.value)}
                                placeholder="e.g., How long does shipping take?"
                            />
                        </div>

                        <div>
                            <Label className="text-xs">Answer</Label>
                            <Textarea
                                value={item.answer}
                                onChange={(e) => updateItem(idx, "answer", e.target.value)}
                                placeholder="Detailed answer..."
                                rows={2}
                            />
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                        No questions yet. Click "Add question" to start.
                    </p>
                )}
            </div>
        </div>
    );
}