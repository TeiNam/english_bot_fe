import axios from 'axios';
import { Answer } from '../types/smallTalk';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8000';

export const getAnswers = async (talkId: number): Promise<Answer[]> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Answer[]>(`${API_URL}/answers/${talkId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getAnswerCount = async (talkId: number): Promise<number> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<{ talk_id: number; answer_count: number }>(
        `${API_URL}/answers/${talkId}/count`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data.answer_count;
};

export const createAnswer = async (data: Partial<Answer>): Promise<Answer> => {
    const token = useAuthStore.getState().token;
    const response = await axios.post(`${API_URL}/answers/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateAnswer = async (answerId: number, data: Partial<Answer>): Promise<Answer> => {
    const token = useAuthStore.getState().token;
    const response = await axios.put(`${API_URL}/answers/${answerId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await axios.delete(`${API_URL}/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};