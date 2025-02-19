import axiosClient from './axiosClient';
import { Answer } from '../types/smallTalk';

export const getAnswers = async (talkId: number): Promise<Answer[]> => {
    const response = await axiosClient.get<Answer[]>(`/answers/${talkId}`);
    return response.data;
};

export const getAnswerCount = async (talkId: number): Promise<number> => {
    const response = await axiosClient.get<{ talk_id: number; answer_count: number }>(`/answers/${talkId}/count`);
    return response.data.answer_count;
};

export const createAnswer = async (data: Partial<Answer>): Promise<Answer> => {
    const response = await axiosClient.post('/answers', data);
    return response.data;
};

export const updateAnswer = async (answerId: number, data: Partial<Answer>): Promise<Answer> => {
    const response = await axiosClient.put(`/answers/${answerId}`, data);
    return response.data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
    await axiosClient.delete(`/answers/${answerId}`);
};