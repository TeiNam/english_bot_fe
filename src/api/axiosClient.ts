import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { config } from '../config/index';

const axiosClient = axios.create({
    baseURL: `${config.apiUrl}/api/v1`,
    timeout: config.timeout, // 60 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

const retryState = new Map();

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers = config.headers || {};

        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    response => {
        // Reset retry count for this request URL on success
        if (response.config.url) {
            retryState.delete(response.config.url);
        }
        return response;
    },
    async error => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url;

        if (!requestUrl) {
            return Promise.reject(error);
        }

        // Get or initialize retry count for this URL
        let retryCount = retryState.get(requestUrl) || 0;

        // Connection refused or network error
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            if (retryCount < config.retries) {
                retryCount++;
                retryState.set(requestUrl, retryCount);

                // Calculate backoff delay with exponential backoff and jitter
                const backoffDelay = Math.min(
                    config.initialBackoffDelay * Math.pow(2, retryCount - 1) * (1 + Math.random() * 0.1),
                    config.maxBackoffDelay
                );

                console.log(`재시도 중 (${retryCount}/${config.retries}) - ${backoffDelay}ms 후`);

                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return axiosClient(originalRequest);
            } else {
                // Clean up retry state when max retries reached
                retryState.delete(requestUrl);
            }
        }

        // Authentication errors
        if (error.response?.status === 401) {
            const authStore = useAuthStore.getState();
            authStore.logout();

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }

            return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'));
        }

        // Log detailed error information
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            code: error.code,
            url: originalRequest?.url
        });

        return Promise.reject(error);
    }
);

export default axiosClient