import axios from 'axios';
import { SmallTalk, SmallTalkResponse } from '../types/smallTalk';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<SmallTalkResponse> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<SmallTalkResponse>('/api/v1/small-talk/', {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<SmallTalk>(`/api/v1/small-talk/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createSmallTalk = async (data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.post<SmallTalk>('/api/v1/small-talk/', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSmallTalk = async (talkId: number, data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.put<SmallTalk>(`/api/v1/small-talk/${talkId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteSmallTalk = async (talkId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await apiClient.delete(`/api/v1/small-talk/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};