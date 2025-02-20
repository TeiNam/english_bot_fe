import axios, {InternalAxiosRequestConfig} from 'axios';
import {config} from '../config';
import {ApiError} from '../types/api';

// Get token function to avoid circular dependency
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
    baseURL: `${config.apiUrl}/api/v1`,
    timeout: config.timeout, // 60 seconds
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// 재시도 상태를 추적하기 위한 Map
const retryState = new Map();

// Request Interceptor
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers = config.headers || {};

        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // URL 로깅 추가
        console.log('Request URL:', config.baseURL + config.url);

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 에러 핸들러 함수
const errorHandler = (error: any): Promise<ApiError> => {
    const errorResponse: ApiError = {
        message: '알 수 없는 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
        status: 500
    };

    const originalRequest = error.config;
    const requestUrl = originalRequest?.url;

    // 재시도 로직
    if (requestUrl) {
        let retryCount = retryState.get(requestUrl) || 0;

        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            if (retryCount < config.retries) {
                retryCount++;
                retryState.set(requestUrl, retryCount);

                const backoffDelay = Math.min(
                    config.initialBackoffDelay * Math.pow(2, retryCount - 1) * (1 + Math.random() * 0.1),
                    config.maxBackoffDelay
                );

                console.log(`재시도 중 (${retryCount}/${config.retries}) - ${backoffDelay}ms 후`);

                return new Promise(resolve => setTimeout(resolve, backoffDelay))
                    .then(() => axiosClient(originalRequest));
            } else {
                retryState.delete(requestUrl);
                errorResponse.message = '서버에 연결할 수 없습니다.';
                errorResponse.code = 'NETWORK_ERROR';
                errorResponse.status = 0;
            }
        }
    }

    // 인증 에러 처리
    if (error.response?.status === 401) {
        try {
            const authData = localStorage.getItem('auth-storage');
            if (authData) {
                localStorage.removeItem('auth-storage');
            }
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
                errorResponse.message = '세션이 만료되었습니다. 다시 로그인해주세요.';
                errorResponse.code = 'SESSION_EXPIRED';
                errorResponse.status = 401;
                return Promise.reject(errorResponse);
            }
            errorResponse.message = '인증에 실패했습니다.';
            errorResponse.code = 'AUTHENTICATION_FAILED';
            errorResponse.status = 401;
        } catch (e) {
            console.error('Error handling auth error:', e);
            throw error;
        }
    }

    // HTTP 상태 코드별 에러 처리
    else if (error.response) {
        errorResponse.status = error.response.status;

        switch (error.response.status) {
            case 400:
                errorResponse.message = error.response.data?.detail || '잘못된 요청입니다.';
                errorResponse.code = 'BAD_REQUEST';
                break;
            case 403:
                errorResponse.message = '접근 권한이 없습니다.';
                errorResponse.code = 'FORBIDDEN';
                break;
            case 404:
                errorResponse.message = '요청한 리소스를 찾을 수 없습니다.';
                errorResponse.code = 'NOT_FOUND';
                break;
            case 429:
                errorResponse.message = '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
                errorResponse.code = 'TOO_MANY_REQUESTS';
                break;
            case 500:
                errorResponse.message = '서버 오류가 발생했습니다.';
                errorResponse.code = 'SERVER_ERROR';
                break;
            default:
                errorResponse.message = error.response.data?.detail ||
                    error.response.data?.message ||
                    error.response.statusText ||
                    '알 수 없는 오류가 발생했습니다.';
                errorResponse.code = error.response.data?.code || `ERROR_${error.response.status}`;
        }
    }
    // 네트워크 오류 처리
    else if (error.request) {
        errorResponse.message = '서버에 연결할 수 없습니다.';
        errorResponse.code = 'NETWORK_ERROR';
        errorResponse.status = 0;
    }

    // 자세한 에러 로깅
    console.error('API Error:', {
        status: errorResponse.status,
        code: errorResponse.code,
        message: errorResponse.message,
        url: originalRequest?.url,
        requestData: originalRequest?.data,
        responseData: error.response?.data,
        originalError: error
    });

    return Promise.reject(errorResponse);
};

// Response Interceptor
axiosClient.interceptors.response.use(
    response => {
        // 성공적인 응답의 경우 재시도 카운터 리셋
        if (response.config.url) {
            retryState.delete(response.config.url);
        }
        return response;
    },
    errorHandler
);

// API URL 가져오기 메서드 추가
axiosClient.getUri = () => config.apiUrl;

export default axiosClient;