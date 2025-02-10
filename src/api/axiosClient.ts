import axios from 'axios';
import { config } from '../config';

const axiosClient = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
    (config) => {
        // CORS 관련 헤더 추가
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Authentication error:', error);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error);
        } else {
            console.error('API error:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;