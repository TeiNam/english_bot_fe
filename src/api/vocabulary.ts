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