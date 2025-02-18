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
    timeout: 30000, // 30 seconds
    retries: 3,
};