import axiosClient from './axiosClient';
import {Diary, DiaryCreate, DiaryUpdate, PageResponse} from '../types/diary';

export const getDiaries = async (page: number = 1, size: number = 10): Promise<PageResponse<Diary>> => {
    const response = await axiosClient.get<PageResponse<Diary>>('/diary', {
        params: {
            page: Math.max(1, Math.floor(page)),
            size: Math.max(1, Math.floor(size))
        }
    });
    return response.data;
};

export const getDiary = async (diaryId: number): Promise<Diary> => {
    const response = await axiosClient.get<Diary>(`/diary/${diaryId}`);
    return response.data;
};

export const getDiaryByDate = async (date: string): Promise<Diary> => {
    const response = await axiosClient.get<Diary>(`/diary/date/${date}`);
    return response.data;
};

export const createDiary = async (data: DiaryCreate): Promise<Diary> => {
    console.log('Request data:', data);  // 요청 데이터 확인

    try {
        const response = await axiosClient.post<Diary>('/diary', data);
        console.log('Response:', response.data);  // 응답 데이터 확인
        return response.data;
    } catch (error) {
        console.log('Error response:', error);  // 에러 응답 데이터 확인
        throw error;
    }
};

export const updateDiary = async (diaryId: number, data: DiaryUpdate): Promise<Diary> => {
    console.log('Updating diary with data:', {diaryId, data});
    const response = await axiosClient.put<Diary>(
        `/diary/${diaryId}`,
        data,
    );
    console.log('Update diary response:', response.data);
    return response.data;
};

export const deleteDiary = async (diaryId: number): Promise<void> => {
    await axiosClient.delete(`/diary/${diaryId}`);
};

export const generateFeedback = async (diaryId: number): Promise<Diary> => {
    const response = await axiosClient.post<Diary>(
        `/diary/${diaryId}/feedback`,
        null,
    );
    return response.data;
};