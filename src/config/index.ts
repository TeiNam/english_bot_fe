// 프록시 설정에 따른 API URL 구성
const getApiUrl = () => {
    if (import.meta.env.DEV) {
        // 개발 환경에서는 프록시 사용
        return '/api/v1';
    }
    // 운영 환경에서는 환경 변수 사용
    return `${import.meta.env.VITE_API_URL}/api/v1`;
};

export const config = {
    apiUrl: getApiUrl()
};