import type { User } from "wle-core";
import { create } from "zustand";
import { showUser } from "~/api/http-requests";

interface UserDetailState {
    user: User | null;
    loading: boolean;
    error: string | null;
    fetchUser: (userId: number) => Promise<void>;
    clearUser: () => void;
}

export const useUserDetailStore = create<UserDetailState>((set) => ({
    user: null,
    loading: false,
    error: null,
    fetchUser: async (userId: number) => {
        set({ loading: true, error: null });
        try {
            const response = await showUser(userId);
            set({ user: response.data?.user, loading: false });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },
    clearUser: () => set({ user: null, error: null, loading: false }),
}));