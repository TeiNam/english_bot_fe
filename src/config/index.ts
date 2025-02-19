// 프록시 설정에 따른 API URL 구성
const getApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
        console.warn('VITE_API_URL is not defined in environment variables');
        return import.meta.env.DEV
            ? 'http://localhost:8000'
            : window.location.origin;  // 현재 도메인 사용
    }

    // 운영 환경에서는 현재 도메인의 프로토콜 사용
    if (!import.meta.env.DEV) {
        const url = new URL(apiUrl);
        url.protocol = window.location.protocol;
        return url.toString();
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