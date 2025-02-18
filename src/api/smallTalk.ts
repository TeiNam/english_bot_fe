import axiosClient from './axiosClient';
import { SmallTalk, SmallTalkResponse, SentenceResponse } from '../types/smallTalk';

export type Direction = 'current' | 'prev' | 'next';

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<SmallTalkResponse> => {
    const response = await axiosClient.get<SmallTalkResponse>('/small-talk/', {
        params: { page, size }
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    const response = await axiosClient.get<SmallTalk>(`/small-talk/${talkId}`);
    return response.data;
};

export const createSmallTalk = async (data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const response = await axiosClient.post<SmallTalk>('/small-talk/', data);
    return response.data;
};

export const updateSmallTalk = async (talkId: number, data: Partial<SmallTalk>): Promise<SmallTalk> => {
    const response = await axiosClient.put<SmallTalk>(`/small-talk/${talkId}`, data);
    return response.data;
};

export const deleteSmallTalk = async (talkId: number): Promise<void> => {
    await axiosClient.delete(`/small-talk/${talkId}`);
};

export const getSentence = async (direction: Direction = 'current', currentTalkId?: number): Promise<SentenceResponse> => {
    const params: Record<string, string | number> = { direction };
    if (currentTalkId) {
        params.current_talk_id = currentTalkId;
    }

    const response = await axiosClient.get<SentenceResponse>('/small-talk/sentence', { params });
    return response.data;
};