// axiosClient.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosClient = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers = config.headers || {};

        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    response => response,
    error => {
        const authStore = useAuthStore.getState();

        // 401 에러 (인증 실패) 또는 토큰 만료 에러 처리
        if (error.response?.status === 401 ||
            error.response?.data?.detail?.includes('expired') ||
            error.response?.data?.message?.includes('expired')) {
            // 로그아웃 처리
            authStore.logout();

            // 현재 URL이 로그인 페이지가 아닌 경우에만 리다이렉트
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }

            return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'));
        }

        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
        } else {
            console.error('API error:', error);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;