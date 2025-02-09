import axios from 'axios';
import { SmallTalk, SmallTalkResponse } from '../types/smallTalk';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

export interface SentenceResponse {
    data: {
        talk_id: number;
        eng_sentence: string;
        kor_sentence: string | null;
        parenthesis: string | null;
        tag: string | null;
    };
    navigation: {
        has_prev: boolean;
        has_next: boolean;
        prev_id: number | null;
        next_id: number;
    };
}

export type Direction = 'current' | 'prev' | 'next';

const API_URL = config.apiUrl;

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (!config.headers) {
            config.headers = {};
        }

        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // 토큰이 만료되었을 때
            const authStore = useAuthStore.getState();
            authStore.logout();  // 토큰 제거
            window.location.href = '/login';  // 로그인 페이지로 리다이렉트
            return Promise.reject(new Error('Session expired. Please login again.'));
        }
        return Promise.reject(error);
    }
);

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<SmallTalkResponse> => {
    const response = await apiClient.get<SmallTalkResponse>('/api/v1/small-talk/', {
        params: { page, size }
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    const response = await apiClient.get<SmallTalk>(`/api/v1/small-talk/${talkId}`);
    return response.data;
};

export const createSmallTalk = async (data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const response = await apiClient.post<SmallTalk>('/api/v1/small-talk/', data);
    return response.data;
};

export const updateSmallTalk = async (talkId: number, data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const response = await apiClient.put<SmallTalk>(`/api/v1/small-talk/${talkId}`, data);
    return response.data;
};

export const deleteSmallTalk = async (talkId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/small-talk/${talkId}`);
};

export const getSentence = async (direction: Direction = 'current', currentTalkId?: number): Promise<SentenceResponse> => {
    const params: Record<string, string | number> = { direction };
    if (currentTalkId) {
        params.current_talk_id = currentTalkId;
    }

    const response = await apiClient.get<SentenceResponse>('/api/v1/small-talk/sentence', { params });
    return response.data;
};