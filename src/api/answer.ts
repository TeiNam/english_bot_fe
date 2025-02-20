// src/api/answer.ts
import axiosClient from './axiosClient';
import {ApiResponse} from '../types/api';
import {Answer} from '../types/answer';

export const getAnswers = async (talkId: number): Promise<Answer[]> => {
    try {
        const response = await axiosClient.get<ApiResponse<Answer[]>>(`/answers/${talkId}`);
        return response.data.data;
    } catch (error: any) {
        if (error?.status === 404) {
            return [];
        }
        throw error;
    }
};

// src/api/answer.ts
export const getAnswerCount = async (talkId: number): Promise<number> => {
    try {
        const response = await axiosClient.get<ApiResponse<{
            talk_id: number,
            answer_count: number
        }>>(`/answers/${talkId}/count`);
        // data 안에 있는 answer_count를 반환
        return response.data?.data?.answer_count ?? 0;
    } catch (error: any) {
        if (error?.status === 404) {
            return 0;
        }
        console.warn(`Failed to get answer count for talk ${talkId}:`, error);
        return 0;
    }
};

export const createAnswer = async (data: Partial<Answer>): Promise<Answer> => {
    try {
        console.log('Creating answer with URL:', axiosClient.getUri() + '/answers');
        const response = await axiosClient.post<ApiResponse<Answer>>('/answers', data);
        return response.data.data;
    } catch (error) {
        console.error('Failed to create answer:', error);
        throw error;
    }
};

export const updateAnswer = async (answerId: number, data: Partial<Answer>): Promise<Answer> => {
    const response = await axiosClient.put<ApiResponse<Answer>>(`/answers/${answerId}`, data);
    return response.data.data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/answers/${answerId}`);
};