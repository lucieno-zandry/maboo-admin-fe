import { toast } from 'sonner'
import type { User } from 'wle-core'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { HttpException } from '~/api/app-fetch'
import { getAuthUser } from '~/api/http-requests'

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

// Define the Zustand store type
interface AuthStore {
    authStatus: AuthStatus
    user: User | null
    setUser: (user: User | null) => void
    clearUser: () => void
    fetchAuth: () => Promise<User | null>
}

// Create the store
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            authStatus: 'unknown',
            user: null,
            setUser: (user) => {
                const authStatus: AuthStatus = user ? 'authenticated' : 'unauthenticated'
                set({ user, authStatus });
            },
            clearUser: () => set({ user: null, authStatus: 'unauthenticated' }),
            fetchAuth: async () => {
                const { setUser } = get();
                let user: User | null = null;

                try {
                    const response = await getAuthUser();
                    user = response.data!.user;
                } catch (e) {
                    if (e instanceof HttpException) {
                        toast.error('Failed to get user.');
                    }
                }

                setUser(user);
                return user;
            }
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                authStatus: state.authStatus,
            }),
        }
    )
)