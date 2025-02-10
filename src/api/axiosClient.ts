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
        if (error.response?.status === 401) {
            const authStore = useAuthStore.getState();
            authStore.logout();
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please login again.'));
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
        } else {
            console.error('API error:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;