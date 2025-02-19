import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    user: any | null;
    setAuth: (token: string, user: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setAuth: (token, user) => {
                // 토큰을 메모리에만 저장
                set({ token, user: { ...user, token: undefined } });
            },
            logout: () => {
                set({ token: null, user: null });
                sessionStorage.clear();
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                // 토큰을 제외한 사용자 정보만 저장
                user: state.user,
                token: null
            })
        }
    )
);