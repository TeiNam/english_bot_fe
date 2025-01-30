import axios from 'axios';
import { SmallTalk, SmallTalkResponse } from '../types/smallTalk';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<SmallTalkResponse> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<SmallTalkResponse>(`${API_URL}/small-talk/`, {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get(`${API_URL}/small-talk/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createSmallTalk = async (data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_URL}/small-talk/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSmallTalk = async (talkId: number, data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const token = useAuthStore.getState().token;
    const response = await axios.put(`${API_URL}/small-talk/${talkId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteSmallTalk = async (talkId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await axios.delete(`${API_URL}/small-talk/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};