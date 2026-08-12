import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { ComparisonRow } from "wle-core";

interface Props {
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
}

export function ComparisonContentEditor({ value, onChange }: Props) {
    const rows: ComparisonRow[] = value.rows ?? [];
    const eyebrow = value.eyebrow ?? "Why it matters";
    const ourLabel = value.ourLabel ?? "🌿 Épices SAVA";
    const theirLabel = value.theirLabel ?? "Supermarket Spices";

    const updateMeta = (field: string, val: string) => {
        onChange({ ...value, [field]: val, rows });
    };

    const updateRows = (newRows: ComparisonRow[]) => {
        onChange({ ...value, rows: newRows, eyebrow, ourLabel, theirLabel });
    };

    const addRow = () => {
        const newId = crypto.randomUUID();
        updateRows([...rows, { id: newId, criteria: "", ours: "", theirs: "" }]);
    };

    const removeRow = (index: number) => {
        const updated = [...rows];
        updated.splice(index, 1);
        updateRows(updated);
    };

    const updateRow = (index: number, field: keyof ComparisonRow, val: string | boolean) => {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: val };
        updateRows(updated);
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            {/* Section meta */}
            <div>
                <Label className="text-xs font-medium">Eyebrow</Label>
                <Input value={eyebrow} onChange={(e) => updateMeta("eyebrow", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs font-medium">Our label</Label>
                    <Input value={ourLabel} onChange={(e) => updateMeta("ourLabel", e.target.value)} />
                </div>
                <div>
                    <Label className="text-xs font-medium">Their label</Label>
                    <Input value={theirLabel} onChange={(e) => updateMeta("theirLabel", e.target.value)} />
                </div>
            </div>

            {/* Rows editor */}
            <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Comparison rows</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addRow}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add row
                    </Button>
                </div>

                {rows.map((row, idx) => (
                    <div key={row.id} className="border rounded-lg p-3 space-y-2 mb-2 bg-background">
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Row {idx + 1}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 text-destructive"
                                onClick={() => removeRow(idx)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div>
                            <Label className="text-xs">Criteria</Label>
                            <Input
                                value={row.criteria}
                                onChange={(e) => updateRow(idx, "criteria", e.target.value)}
                                placeholder="e.g., Origin"
                            />
                        </div>

                        {/* Our value */}
                        <div>
                            <Label className="text-xs">Our value</Label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Switch
                                    checked={typeof row.ours === "boolean"}
                                    onCheckedChange={(checked) => {
                                        if (checked) updateRow(idx, "ours", true);
                                        else updateRow(idx, "ours", "");
                                    }}
                                />
                                <span className="text-xs">Boolean</span>
                                {typeof row.ours === "boolean" ? (
                                    <div className="flex gap-2 ml-2">
                                        <Button
                                            size="sm"
                                            variant={row.ours === true ? "default" : "outline"}
                                            onClick={() => updateRow(idx, "ours", true)}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={row.ours === false ? "default" : "outline"}
                                            onClick={() => updateRow(idx, "ours", false)}
                                        >
                                            No
                                        </Button>
                                    </div>
                                ) : (
                                    <Input
                                        value={row.ours as string}
                                        onChange={(e) => updateRow(idx, "ours", e.target.value)}
                                        placeholder="Text value"
                                        className="flex-1 min-w-[150px]"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Their value */}
                        <div>
                            <Label className="text-xs">Their value</Label>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Switch
                                    checked={typeof row.theirs === "boolean"}
                                    onCheckedChange={(checked) => {
                                        if (checked) updateRow(idx, "theirs", true);
                                        else updateRow(idx, "theirs", "");
                                    }}
                                />
                                <span className="text-xs">Boolean</span>
                                {typeof row.theirs === "boolean" ? (
                                    <div className="flex gap-2 ml-2">
                                        <Button
                                            size="sm"
                                            variant={row.theirs === true ? "default" : "outline"}
                                            onClick={() => updateRow(idx, "theirs", true)}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={row.theirs === false ? "default" : "outline"}
                                            onClick={() => updateRow(idx, "theirs", false)}
                                        >
                                            No
                                        </Button>
                                    </div>
                                ) : (
                                    <Input
                                        value={row.theirs as string}
                                        onChange={(e) => updateRow(idx, "theirs", e.target.value)}
                                        placeholder="Text value"
                                        className="flex-1 min-w-[150px]"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {rows.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                        No rows. Click "Add row" to start.
                    </p>
                )}
            </div>
        </div>
    );
}