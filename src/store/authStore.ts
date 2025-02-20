import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

interface AuthState {
    token: string | null;
    user: any | null;
    tokenExpiry: number | null;
    setAuth: (token: string, user: any, expiry: number) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    getToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            tokenExpiry: null,
            setAuth: (token, user, tokenExpiry) => {
                set({token, user, tokenExpiry});
            },
            logout: () => {
                set({token: null, user: null, tokenExpiry: null});
                sessionStorage.clear();
                window.location.href = '/login';
            },
            isAuthenticated: () => {
                const state = get();  // 이제 get() 사용 가능
                return !!(state.token && state.tokenExpiry && Date.now() < state.tokenExpiry);
            },
            getToken: () => {
                const state = get();  // 이제 get() 사용 가능
                if (state.token && state.tokenExpiry && Date.now() < state.tokenExpiry) {
                    return state.token;
                }
                return null;
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state: AuthState) => ({
                user: state.user,
                token: state.token,
                tokenExpiry: state.tokenExpiry
            })
        }
    )
);