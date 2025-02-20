// axiosClient.ts
import axios, {InternalAxiosRequestConfig} from 'axios';
import {config} from '../config';
import {ApiError} from '../types/api';
import {AuthResponse} from '../types/auth';
import {useAuthStore} from '../store/authStore';

const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        console.warn('VITE_API_URL is not defined in environment variables');
        return import.meta.env.DEV
            ? 'http://localhost:8000'
            : window.location.origin;
    }

    try {
        const url = new URL(apiUrl);
        if (window.location.protocol === 'https:') {
            url.protocol = 'https:';
        }
        return url.toString().replace(/\/$/, '');
    } catch (error) {
        console.error('Invalid API URL:', error);
        return window.location.protocol === 'https:'
            ? apiUrl.replace('http:', 'https:')
            : apiUrl;
    }
};

const getAuthToken = () => {
    try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
            const {state} = JSON.parse(authData);
            return state?.token || null;
        }
    } catch (e) {
        console.error('Error reading auth token:', e);
    }
    return null;
};

const axiosClient = axios.create({
    baseURL: `${getApiUrl()}/api/v1`,
    timeout: config.timeout,
    maxRedirects: 5,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
});

const retryState = new Map();
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 토큰 갱신 함수
const refreshToken = async (): Promise<string> => {
    try {
        const response = await axiosClient.post<AuthResponse>('/api/v1/auth/refresh');
        const {data} = response;

        if (data?.access_token) {
            const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
            useAuthStore.getState().setAuth(data.access_token, data.user, tokenExpiry);
            return data.access_token;
        }
        throw new Error('토큰 갱신 실패: 유효하지 않은 응답');
    } catch (error) {
        console.error('Token refresh failed:', error);
        useAuthStore.getState().logout();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
};

// Request Interceptor
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers = config.headers || {};
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('Request URL:', config.baseURL + config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

const errorHandler = async (error: any): Promise<ApiError> => {
    const errorResponse: ApiError = {
        message: '알 수 없는 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
        status: 500
    };

    const originalRequest = error.config;

    // 401 에러 및 토큰 갱신 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({resolve, reject});
            })
                .then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await refreshToken();
            processQueue(null, newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }

    // 나머지 에러 처리 로직은 그대로 유지
    const requestUrl = originalRequest?.url;
    if (requestUrl) {
        // ... 기존의 retry 로직 유지
    }

    // ... 기존의 나머지 에러 처리 로직 유지

    return Promise.reject(errorResponse);
};

// Response Interceptor
axiosClient.interceptors.response.use(
    response => {
        if (response.config.url) {
            retryState.delete(response.config.url);
        }
        return response;
    },
    errorHandler
);

axiosClient.getUri = () => `${getApiUrl()}/api/v1`;

export default axiosClient;