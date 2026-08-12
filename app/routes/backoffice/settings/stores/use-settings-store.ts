import type { Setting } from 'wle-core';
import { create } from 'zustand';
import { getSettings, updateSetting } from '~/api/http-requests';

interface SettingsStore {
    settings: Setting[] | null;
    isLoading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    updateSetting: (setting: Setting) => Promise<void>;

    // Non-reactive getter (can be called anywhere)
    getSetting: (key: string, defaultValue?: any) => any;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: [],
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await getSettings();
            set({ settings: response.data!, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateSetting: async (setting) => {
        set({ isLoading: true, error: null });
        try {
            const response = await updateSetting(setting);
            const updatedSetting = response.data!;

            set((state) => ({
                settings: state.settings?.map((s) =>
                    s.key === setting.key ? { ...s, value: updatedSetting.value } : s
                ),
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    getSetting: (key: string, defaultValue: any = null) => {
        const setting = get().settings?.find((s) => s.key === key);
        return setting?.value ?? defaultValue;
    },
}));