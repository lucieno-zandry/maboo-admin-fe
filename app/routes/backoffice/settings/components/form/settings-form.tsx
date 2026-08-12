import { useForm } from "react-hook-form";
import { Form } from "~/components/ui/form";
import { SettingField } from "./setting-field";
import { Button } from "~/components/ui/button";
import type { Setting } from "wle-core";

interface SettingsFormProps {
  settings: Setting[];
  onSave: (setting: Setting) => Promise<void>;
}

export function SettingsForm({ settings, onSave }: SettingsFormProps) {
  // Initialize form with current values
  const defaultValues = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, any>);

  const form = useForm({ defaultValues });
  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = async (data: Record<string, any>) => {
    // Save each changed setting sequentially
    for (const setting of settings) {
      if (data[setting.key] !== setting.value) {
        await onSave({ ...setting, value: data[setting.key] });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {settings.map((setting) => (
          <SettingField key={setting.key} setting={setting} control={form.control} />
        ))}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}