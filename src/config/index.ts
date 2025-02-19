// 프록시 설정에 따른 API URL 구성
const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        console.warn('VITE_API_URL is not defined in environment variables');
        return 'http://localhost:8000';
    }
    return apiUrl;
};

export const config = {
    apiUrl: getApiUrl(),
    timeout: 60000, // 60 seconds
    retries: 5,
    maxBackoffDelay: 30000, // 30초 최대 백오프 딜레이
    initialBackoffDelay: 1000, // 1초 초기 백오프 딜레이
};