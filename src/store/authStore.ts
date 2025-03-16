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
                // 먼저 상태 초기화
                set({token: null, user: null, tokenExpiry: null});
                
                // 스토리지 정리 
                sessionStorage.clear();
                localStorage.removeItem('auth-storage');
                
                // 현재 위치 저장 (로그인 후 리디렉션을 위해)
                const currentPath = window.location.pathname;
                if (currentPath !== '/login') {
                    sessionStorage.setItem('redirectAfterLogin', currentPath);
                }
                
                // 로그인 페이지로 리디렉션
                window.location.href = '/login';
            },
            isAuthenticated: () => {
                const state = get();
                if (!state.token || !state.tokenExpiry) return false;
                if (Date.now() >= state.tokenExpiry) {
                    // 이 부분에서 직접 logout 호출 - 비동기적으로 처리
                    setTimeout(() => get().logout(), 0);
                    return false;
                }
                return true;
            },
            getToken: () => {
                const state = get();
                if (state.token && state.tokenExpiry && Date.now() < state.tokenExpiry) {
                    return state.token;
                }
                // 이 부분에서 직접 logout 호출 - 비동기적으로 처리
                setTimeout(() => get().logout(), 0);
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