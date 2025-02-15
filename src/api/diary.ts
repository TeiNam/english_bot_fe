import axios from 'axios';
import { Diary, PageResponse, DiaryCreate, DiaryUpdate } from '../types/diary';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

export const getDiaries = async (page: number = 1, size: number = 10): Promise<PageResponse<Diary>> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<PageResponse<Diary>>(`${API_URL}/api/v1/diary`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        params: {
            page: Math.max(1, Math.floor(page)),
            size: Math.max(1, Math.floor(size))
        }
    });
    return response.data;
};

export const getDiary = async (diaryId: number): Promise<Diary> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Diary>(`${API_URL}/api/v1/diary/${diaryId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getDiaryByDate = async (date: string): Promise<Diary> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Diary>(`${API_URL}/api/v1/diary/date/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createDiary = async (data: DiaryCreate): Promise<Diary> => {
    const token = useAuthStore.getState().token;
    console.log('Request data:', data);  // 요청 데이터 확인

    try {
        const response = await axios.post<Diary>(
            `${API_URL}/api/v1/diary`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Response:', response.data);  // 응답 데이터 확인
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log('Error response:', error.response?.data);  // 에러 응답 데이터 확인
        }
        throw error;
    }
};

export const updateDiary = async (diaryId: number, data: DiaryUpdate): Promise<Diary> => {
    const token = useAuthStore.getState().token;
    const response = await axios.put<Diary>(
        `${API_URL}/api/v1/diary/${diaryId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const deleteDiary = async (diaryId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await axios.delete(`${API_URL}/api/v1/diary/${diaryId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};