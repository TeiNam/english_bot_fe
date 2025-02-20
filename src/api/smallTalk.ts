import axiosClient from './axiosClient';
import {SentenceResponse, SmallTalk} from '../types/smallTalk';
import {ApiPaginatedResponse, ApiResponse} from '../types/api';

type Direction = 'current' | 'prev' | 'next';

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<ApiPaginatedResponse<SmallTalk>> => {
    const response = await axiosClient.get<ApiPaginatedResponse<SmallTalk>>('/small-talk/', {
        params: {page, size}
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    try {
        const response = await axiosClient.get<SmallTalk>(`/small-talk/${talkId}`);

        if (!response.data) {
            throw new Error('Invalid API response format');
        }

        return response.data;
    } catch (error) {
        console.error('Failed to fetch small talk:', error);
        throw error;
    }
};

export const createSmallTalk = async (data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const response = await axiosClient.post<ApiResponse<SmallTalk>>('/small-talk/', data);
    return response.data.data;
};

export const updateSmallTalk = async (talkId: number, data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const response = await axiosClient.put<ApiResponse<SmallTalk>>(`/small-talk/${talkId}`, data);
    return response.data.data;
};

export const deleteSmallTalk = async (talkId: number): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/small-talk/${talkId}`);
};

export const getSentence = async (direction: Direction = 'current', currentTalkId?: number): Promise<SentenceResponse> => {
    const params: Record<string, string | number> = {direction};
    if (currentTalkId) {
        params.current_talk_id = currentTalkId;
    }

    const response = await axiosClient.get<SentenceResponse>('/small-talk/sentence', {params});
    if (!response.data) {
        throw new Error('Invalid response format');
    }
    return response.data;
};