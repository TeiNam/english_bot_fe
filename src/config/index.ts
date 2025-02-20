// 프로젝트 설정을 위한 인터페이스 정의
interface Config {
    apiUrl: string;
    environment: 'development' | 'production' | 'test';
    version: string;
    sentryDsn?: string;
    timeout: number;
    retries: number;
    maxBackoffDelay: number;
    initialBackoffDelay: number;
}

// 설정 유효성 검사 함수
const validateConfig = (config: Partial<Config>): config is Config => {
    const requiredKeys: (keyof Config)[] = [
        'apiUrl',
        'environment',
        'version',
        'timeout',
        'retries',
        'maxBackoffDelay',
        'initialBackoffDelay'
    ];
    return requiredKeys.every(key => key in config);
};

// API URL 구성 함수
const getApiUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
        console.warn('VITE_API_URL is not defined in environment variables');
        return import.meta.env.DEV
            ? 'http://localhost:8000'
            : window.location.origin;
    }

    try {
        const url = new URL(apiUrl);

        // 운영 환경이거나 HTTPS가 필요한 경우 강제로 HTTPS 사용
        if (!import.meta.env.DEV || window.location.protocol === 'https:') {
            url.protocol = 'https:';
        }

        return url.toString().replace(/\/$/, '');
    } catch (error) {
        console.error('Invalid API URL:', error);
        // 에러 발생시에도 프로토콜 강제 변경
        return import.meta.env.DEV
            ? apiUrl  // 개발 환경에서는 원래 URL 사용
            : apiUrl.replace('http:', 'https:');  // 운영 환경에서는 https로 강제 변경
    }
};

// 설정 가져오기 함수
export const getConfig = (): Config => {
    const config = {
        apiUrl: getApiUrl(),
        environment: import.meta.env.MODE as 'development' | 'production' | 'test',
        version: import.meta.env.VITE_APP_VERSION || '0.0.0',
        sentryDsn: import.meta.env.VITE_SENTRY_DSN,
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000', 10),
        retries: parseInt(import.meta.env.VITE_API_RETRIES || '5', 10),
        maxBackoffDelay: parseInt(import.meta.env.VITE_MAX_BACKOFF_DELAY || '30000', 10),
        initialBackoffDelay: parseInt(import.meta.env.VITE_INITIAL_BACKOFF_DELAY || '1000', 10)
    };

    if (!validateConfig(config)) {
        throw new Error('Missing required configuration values');
    }

    // 설정값 유효성 검사
    if (config.timeout < 1000) {
        console.warn('API timeout is set to less than 1 second');
        config.timeout = 60000; // 기본값으로 설정
    }

    if (config.retries < 0) {
        console.warn('API retries cannot be negative');
        config.retries = 5; // 기본값으로 설정
    }

    if (config.maxBackoffDelay < config.initialBackoffDelay) {
        console.warn('Maximum backoff delay cannot be less than initial backoff delay');
        config.maxBackoffDelay = Math.max(config.initialBackoffDelay * 2, 30000);
    }

    return config;
};

// 설정 객체 생성
export const config = getConfig();

// 추가 유틸리티 함수들
export const isDevelopment = (): boolean => config.environment === 'development';
export const isProduction = (): boolean => config.environment === 'production';
export const isTest = (): boolean => config.environment === 'test';

// 환경별 로깅 함수
export const log = {
    debug: (...args: any[]) => {
        if (isDevelopment()) {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args: any[]) => {
        console.log('[INFO]', ...args);
    },
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    },
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
        // Sentry 통합이 있는 경우 에러 로깅
        if (config.sentryDsn && isProduction()) {
            // Sentry.captureException(args);
        }
    }
};

// 타입 익스포트
export type { Config };