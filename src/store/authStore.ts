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
                console.log('Setting auth state:', { token, user }); // 디버깅용 로그
                set({ token, user });
            },
            logout: () => {
                console.log('Logging out'); // 디버깅용 로그
                set({ token: null, user: null });
            },
        }),
        {
            name: 'auth-storage',
            skipHydration: false,
        }
    )
);