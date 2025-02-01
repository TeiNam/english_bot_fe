import axios from 'axios';
import { Vocabulary, VocabularyResponse } from '../types/vocabulary';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error);
        return Promise.reject(error);
    }
);

export const getVocabularies = async (page: number = 1, size: number = 10): Promise<VocabularyResponse> => {
    const token = useAuthStore.getState().token;
    try {
        const response = await apiClient.get<VocabularyResponse>('/api/v1/vocabulary/', {
            params: { page, size },
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching vocabularies:', error);
        throw error;
    }
};

export const getVocabulary = async (vocabularyId: number): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<Vocabulary>(`/api/v1/vocabulary/${vocabularyId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    return response.data;
};

export const createVocabulary = async (data: any): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.post<Vocabulary>('/api/v1/vocabulary/', data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    return response.data;
};

export const updateVocabulary = async (vocabularyId: number, data: any): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.put<Vocabulary>(`/api/v1/vocabulary/${vocabularyId}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    return response.data;
};

export const deleteVocabulary = async (vocabularyId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await apiClient.delete(`/api/v1/vocabulary/${vocabularyId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
};

// 단어 검색 API
export const searchVocabularies = async (query: string, page: number = 1, size: number = 10): Promise<VocabularyResponse> => {
    if (!query.trim()) {
        return getVocabularies(page, size);
    }

    const token = useAuthStore.getState().token;
    try {
        const response = await apiClient.get<VocabularyResponse>('/api/v1/vocabulary/text-search', {
            params: { q: query, page, size },
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching vocabularies:', error);
        throw error;
    }
};

export const getVocabularyMeaningCountsByIds = async (
    vocabularyIds: number[]
): Promise<Record<number, number>> => {
    if (!vocabularyIds.length) return {};  // 빈 배열일 경우 빈 객체 반환

    const token = useAuthStore.getState().token;
    try {
        const response = await apiClient.get<Record<number, number>>('/api/v1/vocabulary/meanings/counts', {
            params: { vocabulary_ids: vocabularyIds },  // 배열을 직접 전달
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json'
            },
            paramsSerializer: params => {
                // vocabulary_ids[]={id} 형식으로 직렬화
                return Object.entries(params)
                    .map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return value.map(v => `${key}=${v}`).join('&');
                        }
                        return `${key}=${value}`;
                    })
                    .join('&');
            }
        });

        return response.data;  // 이미 올바른 형식으로 반환되므로 추가 변환 불필요
    } catch (error) {
        console.error('Error fetching meaning counts:', error);
        throw error;
    }
};