import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const axiosClient = axios.create({
    baseURL: `${config.apiUrl}/api/v1`,
    timeout: config.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

let retryCount = 0;

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
        retryCount = 0; // Reset retry count on successful response
        return response;
    },
    async error => {
        const originalRequest = error.config;

        // Connection refused or network error
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            if (retryCount < config.retries) {
                retryCount++;
                const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);

                console.log(`Retrying request (${retryCount}/${config.retries}) after ${backoffDelay}ms`);

                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                return axiosClient(originalRequest);
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