import axios from 'axios';
import { SmallTalk, SmallTalkResponse } from '../types/smallTalk';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10초 타임아웃
});

// 응답 인터셉터 추가
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<SmallTalkResponse> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<SmallTalkResponse>('/small-talk/', {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<SmallTalk>(`/small-talk/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createSmallTalk = async (data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.post<SmallTalk>('/small-talk/', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSmallTalk = async (talkId: number, data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.put<SmallTalk>(`/small-talk/${talkId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteSmallTalk = async (talkId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await apiClient.delete(`/small-talk/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};