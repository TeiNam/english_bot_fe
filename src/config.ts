const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;
    // HTTPS 강제 적용이 필요한 경우
    // return url.replace('http://', 'https://');
    return url;
};

export const config = {
    apiUrl: getApiUrl(),
};