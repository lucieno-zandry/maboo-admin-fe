import type { Control } from "react-hook-form";
import type { Setting } from "wle-core";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";

interface SettingFieldProps {
    setting: Setting;
    control: Control<any>;
}

export function SettingField({ setting, control }: SettingFieldProps) {
    const renderInput = (field: any) => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={field.disabled}
                        />
                        <span className="text-sm text-muted-foreground">
                            {field.value ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                );

            case 'string':
                // For currency we could use a select, but since it's generic we'll use text input
                // If you want to special-case currency, check setting.key === 'currency'
                if (setting.key === 'currency') {
                    return (
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={field.disabled}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="EUR">Euro (€)</SelectItem>
                                <SelectItem value="USD">US Dollar ($)</SelectItem>
                                <SelectItem value="GBP">British Pound (£)</SelectItem>
                                <SelectItem value="MGA">Malagasy Ariary (Ar)</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                }
                return <Input {...field} />;

            case 'integer':
            case 'float':
                return <Input type="number" step={setting.type === 'float' ? '0.01' : '1'} {...field} />;

            case 'json':
                return (
                    <Input
                        {...field}
                        value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
                        onChange={(e) => {
                            try {
                                field.onChange(JSON.parse(e.target.value));
                            } catch {
                                field.onChange(e.target.value); // fallback to string if invalid JSON
                            }
                        }}
                    />
                );

            default:
                return <Input {...field} />;
        }
    };

    return (
        <FormField
            control={control}
            name={setting.key}
            render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                            <FormLabel className="text-base font-medium">
                                {setting.label || setting.key}
                            </FormLabel>
                            {setting.description && (
                                <FormDescription>{setting.description}</FormDescription>
                            )}
                        </div>
                        <div className="sm:min-w-[200px] sm:max-w-[300px]">
                            <FormControl>{renderInput(field)}</FormControl>
                        </div>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}