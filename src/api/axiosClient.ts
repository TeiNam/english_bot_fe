// axiosClient.ts
import axios, {InternalAxiosRequestConfig} from 'axios';
import {config} from '../config';
import {ApiError} from '../types/api';
import {AuthResponse} from '../types/auth';
import {useAuthStore} from '../store/authStore';

const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        const defaultUrl = import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin;
        console.warn(`VITE_API_URL is not defined, using default: ${defaultUrl}`);
        return defaultUrl;
    }

    try {
        // 프로덕션 환경에서는 무조건 HTTPS 사용
        if (!import.meta.env.DEV) {
            return apiUrl.replace(/^http:/, 'https:');
        }

        // 개발 환경에서는 현재 페이지의 프로토콜을 따름
        const url = new URL(apiUrl);
        if (window.location.protocol === 'https:') {
            url.protocol = 'https:';
        }

        return url.toString().replace(/\/$/, '');
    } catch (error) {
        console.error('Invalid API URL configuration:', error);
        // 프로덕션 환경에서는 무조건 HTTPS로 강제 변환
        return !import.meta.env.DEV ? apiUrl.replace(/^http:/, 'https:') : apiUrl;
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
        'Accept': 'application/json',
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
        // 요청 URL의 프로토콜 검사 및 로깅
        const fullUrl = `${config.baseURL}${config.url}`;
        const urlObj = new URL(fullUrl);

        console.log('Request URL details:', {
            url: fullUrl,
            protocol: urlObj.protocol,
            host: urlObj.host,
            pathname: urlObj.pathname,
            currentPageProtocol: window.location.protocol
        });

        console.log('axiosClient - Request config:', {
            url: config.url,
            baseURL: config.baseURL,
            method: config.method,
            headers: config.headers,
            isHttps: urlObj.protocol === 'https:'
        });

        config.headers = config.headers || {};
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('axiosClient - Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// 반환 타입을 Promise<any>로 변경하여 다양한 반환 타입을 허용
const errorHandler = async (error: any): Promise<any> => {
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
        const retryCount = retryState.get(requestUrl) || 0;
        if (retryCount < config.retries) {
            retryState.set(requestUrl, retryCount + 1);

            // 지수 백오프로 재시도 간격 계산
            const delay = Math.min(
                config.initialBackoffDelay * Math.pow(2, retryCount),
                config.maxBackoffDelay
            );

            await new Promise(resolve => setTimeout(resolve, delay));
            return axiosClient(originalRequest);
        }
    }

    // 에러 응답 상세 처리
    if (error.response) {
        const {status, data} = error.response;

        switch (status) {
            case 400:
                errorResponse.message = data?.detail || '잘못된 요청입니다.';
                errorResponse.code = 'BAD_REQUEST';
                errorResponse.status = 400;
                break;
            case 403:
                errorResponse.message = '접근 권한이 없습니다.';
                errorResponse.code = 'FORBIDDEN';
                errorResponse.status = 403;
                break;
            case 404:
                errorResponse.message = '요청한 리소스를 찾을 수 없습니다.';
                errorResponse.code = 'NOT_FOUND';
                errorResponse.status = 404;
                break;
            case 429:
                errorResponse.message = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
                errorResponse.code = 'TOO_MANY_REQUESTS';
                errorResponse.status = 429;
                break;
            case 500:
                errorResponse.message = '서버 오류가 발생했습니다.';
                errorResponse.code = 'INTERNAL_SERVER_ERROR';
                errorResponse.status = 500;
                break;
            default:
                errorResponse.message = data?.detail || '알 수 없는 오류가 발생했습니다.';
                errorResponse.code = 'UNKNOWN_ERROR';
                errorResponse.status = status || 500;
        }
    } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        errorResponse.message = '서버에 연결할 수 없습니다.';
        errorResponse.code = 'NETWORK_ERROR';
        errorResponse.status = 0;
    }

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