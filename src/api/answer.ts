// src/api/answer.ts
import axiosClient from './axiosClient';
import {Answer} from '../types/answer';

export const getAnswers = async (talkId: number): Promise<Answer[]> => {
    try {
        const response = await axiosClient.get<Answer[]>(`/answers/${talkId}`);
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error: any) {
        console.warn(`토크 ${talkId}의 답변 목록을 가져오는데 실패했습니다:`, error);
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
        console.error('답변 개수를 가져오는데 실패했습니다:', error);
        return {};
    }
};

export const createAnswer = async (data: Partial<Answer>): Promise<Answer> => {
    try {
        const response = await axiosClient.post<Answer>('/answers', data);
        return response.data;
    } catch (error: any) {
        console.error('답변 생성에 실패했습니다:', error);
        throw error;
    }
};

export const updateAnswer = async (answerId: number, data: Partial<Answer>): Promise<Answer> => {
    try {
        const response = await axiosClient.put<Answer>(`/answers/${answerId}`, data);
        return response.data;
    } catch (error: any) {
        console.error(`답변 ${answerId} 수정에 실패했습니다:`, error);
        throw error;
    }
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
    try {
        await axiosClient.delete(`/answers/${answerId}`);
    } catch (error: any) {
        console.error(`답변 ${answerId} 삭제에 실패했습니다:`, error);
        throw error;
    }
};