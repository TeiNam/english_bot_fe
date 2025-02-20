import axiosClient from './axiosClient';
import {Vocabulary, VocabularyResponse} from '../types/vocabulary';

export const getVocabularies = async (page: number = 1, size: number = 10): Promise<VocabularyResponse> => {
    try {
        const response = await axiosClient.get<VocabularyResponse>('/vocabulary/', {
            params: {page, size}
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching vocabularies:', error);
        throw error;
    }
};

export const getVocabulary = async (vocabularyId: number): Promise<Vocabulary> => {
    const response = await axiosClient.get<Vocabulary>(`/vocabulary/${vocabularyId}`, {
        headers: {'Accept': 'application/json'}
    });
    return response.data;
};

export const createVocabulary = async (data: any): Promise<Vocabulary> => {
    const response = await axiosClient.post<Vocabulary>('/vocabulary/', data, {
        headers: {'Accept': 'application/json'}
    });
    return response.data;
};

export const updateVocabulary = async (vocabularyId: number, data: any): Promise<Vocabulary> => {
    const response = await axiosClient.put<Vocabulary>(`/vocabulary/${vocabularyId}`, data, {
        headers: {'Accept': 'application/json'}
    });
    return response.data;
};

export const deleteVocabulary = async (vocabularyId: number): Promise<void> => {
    await axiosClient.delete(`/vocabulary/${vocabularyId}`, {
        headers: {'Accept': 'application/json'}
    });
};

// 단어 검색 API
export const searchVocabularies = async (query: string, page: number = 1, size: number = 10): Promise<VocabularyResponse> => {
    if (!query.trim()) {
        return getVocabularies(page, size);
    }

    try {
        const response = await axiosClient.get<VocabularyResponse>('/vocabulary/text-search', {
            params: {q: query, page, size}
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

    try {
        const response = await axiosClient.get<Record<number, number>>('/vocabulary/meanings/counts', {
            params: {vocabulary_ids: vocabularyIds},
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