// hooks/use-users-store.ts
import type { User } from "wle-core";
import { create } from "zustand";
import { fetchUsers } from "~/api/http-requests";
import type { FetchUsersParams } from "~/types/users";

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

interface UsersState {
    users: User[];
    meta: PaginationMeta | null;
    loading: boolean;
    error: string | null;
    filters: FetchUsersParams;
    selectedUserId: number | null; // 👈 new

    setFilters: (filters: Partial<FetchUsersParams>) => void;
    setPage: (page: number) => void;
    setSelectedUserId: (id: number | null) => void; // 👈 new
    fetchUsers: () => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    meta: null,
    loading: false,
    error: null,
    selectedUserId: null,
    filters: {
        page: 1,
        per_page: 15,
        role: "all",
        sort_by: "created_at",
        sort_order: "desc",
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: 1 },
        }));
        get().fetchUsers();
    },

    setPage: (page) => {
        set((state) => ({
            filters: { ...state.filters, page },
        }));
        get().fetchUsers();
    },

    setSelectedUserId: (id) => set({ selectedUserId: id }),

    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetchUsers(get().filters);
            const { data: users, ...meta } = response.data!
            set({
                users,
                meta: {
                    current_page: meta.current_page,
                    last_page: meta.last_page,
                    per_page: meta.per_page,
                    total: meta.total,
                },
                loading: false,
            });
        } catch (err) {
            set({ error: (err as Error).message, loading: false });
        }
    },
}));