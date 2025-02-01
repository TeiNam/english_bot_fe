import axios from 'axios';
import { Answer } from '../types/smallTalk';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

export const getAnswers = async (talkId: number): Promise<Answer[]> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Answer[]>(`${API_URL}/api/v1/answers/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getAnswerCount = async (talkId: number): Promise<number> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<{ talk_id: number; answer_count: number }>(
        `${API_URL}/api/v1/answers/${talkId}/count`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data.answer_count;
};

export const createAnswer = async (data: Partial<Answer>): Promise<Answer> => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_URL}/api/v1/answers`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateAnswer = async (answerId: number, data: Partial<Answer>): Promise<Answer> => {
    const token = useAuthStore.getState().token;
    const response = await axios.put(`${API_URL}/api/v1/answers/${answerId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await axios.delete(`${API_URL}/api/v1/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};