import { useEffect } from "react";
import { useSettingsStore } from "./stores/use-settings-store";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SettingsForm } from "./components/form/settings-form";
import type { Setting } from "wle-core";

export default function SettingsPage() {
    const { settings, isLoading, error, fetchSettings, updateSetting } = useSettingsStore();

    const handleSave = async (setting: Setting) => {
        try {
            await updateSetting(setting);
            toast.success(`Setting "${setting.key}" updated successfully`);
        } catch (err) {
            toast.error(`Failed to update "${setting.key}"`);
        }
    };

    // Group settings by 'group' field (e.g., 'general', 'maintenance')
    const groupedSettings = settings?.reduce((acc, setting) => {
        const group = setting.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(setting);
        return acc;
    }, {} as Record<string, typeof settings>);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6 bg-background/80 backdrop-blur-md rounded-2xl">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 bg-background/80 backdrop-blur-md rounded-2xl">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-8 bg-background/80 backdrop-blur-md rounded-2xl h-full overflow-y-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage application configuration and preferences.
                </p>
            </div>


            {groupedSettings && Object.entries(groupedSettings).map(([group, groupSettings]) => (
                <Card key={group}>
                    <CardHeader>
                        <CardTitle className="capitalize">{group}</CardTitle>
                        <CardDescription>
                            Configure {group.toLowerCase()} related settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SettingsForm settings={groupSettings} onSave={handleSave} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}