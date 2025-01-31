import axios from 'axios';
import { config } from '../config';

const axiosClient = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터
axiosClient.interceptors.request.use(
    (config) => {
        // HTTPS 환경에서 추가 설정이 필요한 경우
        if (config.url?.startsWith('https')) {
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }
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
            // 인증 에러 처리
            console.error('Authentication error:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;