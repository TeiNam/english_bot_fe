// src/api/answer.ts
import axiosClient from './axiosClient';
import {Answer} from '../types/answer';

export const getAnswers = async (talkId: number): Promise<Answer[]> => {
    try {
        const response = await axiosClient.get<Answer[]>(`/answers/${talkId}`);
        // 응답 데이터 검증 및 로깅
        console.log('GetAnswers response:', response.data);
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error: any) {
        console.warn(`Failed to get answers for talk ${talkId}:`, error);
        return [];
    }
};

export const getAnswerCounts = async (talkIds: number[]): Promise<Record<number, number>> => {
    if (!talkIds.length) return {};

    try {
        const response = await axiosClient.get<Array<{
            talk_id: number;
            answer_count: number;
        }>>(`/answers/counts?talk_ids=${talkIds.join(',')}`);

        return response.data.reduce((acc, item) => {
            acc[item.talk_id] = item.answer_count;
            return acc;
        }, {} as Record<number, number>);
    } catch (error) {
        console.error('Failed to get answer counts:', error);
        return {};
    }
};

export const createAnswer = async (data: Partial<Answer>): Promise<Answer> => {
    try {
        console.log('Creating answer with data:', data);
        const response = await axiosClient.post<Answer>('/answers', data);
        console.log('Create answer response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to create answer:', error);
        throw error;
    }
};

export const updateAnswer = async (answerId: number, data: Partial<Answer>): Promise<Answer> => {
    const response = await axiosClient.put<Answer>(`/answers/${answerId}`, data);
    return response.data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
    await axiosClient.delete(`/answers/${answerId}`);
};