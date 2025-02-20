import axiosClient from './axiosClient';
import {SmallTalk, SentenceResponse} from '../types/smallTalk';
import {ApiResponse, ApiPaginatedResponse} from '../types/api';

export const getSmallTalks = async (page: number = 1, size: number = 10): Promise<ApiPaginatedResponse<SmallTalk>> => {
    const response = await axiosClient.get<ApiPaginatedResponse<SmallTalk>>('/small-talk/', {
        params: {page, size}
    });
    return response.data;
};

export const getSmallTalk = async (talkId: number): Promise<SmallTalk> => {
    console.log('Fetching small talk for ID:', talkId);
    try {
        const response = await axiosClient.get<ApiResponse<SmallTalk>>(`/small-talk/${talkId}`);
        console.log('SmallTalk API response:', response.data);

        // response 자체가 데이터이므로 data 래핑이 필요 없음
        return {
            ...response.data,  // API 응답 자체가 데이터
            answers: []  // 초기에 빈 배열로 설정
        };
    } catch (error) {
        console.error('Error fetching small talk:', error);
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

export const getSentence = async (direction: Direction = 'current', currentTalkId?: number): Promise<ApiResponse<SentenceResponse>> => {
    const params: Record<string, string | number> = {direction};
    if (currentTalkId) {
        params.current_talk_id = currentTalkId;
    }

    const response = await axiosClient.get<ApiResponse<SentenceResponse>>('/small-talk/sentence', {params});
    return response.data;
};