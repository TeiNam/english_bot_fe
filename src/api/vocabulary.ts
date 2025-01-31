import axios from 'axios';
import { Vocabulary, VocabularyResponse } from '../types/vocabulary';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const apiClient = axios.create({
    baseURL: config.apiUrl,
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
    const response = await apiClient.get<VocabularyResponse>('/vocabulary/', {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getVocabulary = async (vocabularyId: number): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<Vocabulary>(`/vocabulary/${vocabularyId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

interface VocabularyMeaningPayload {
    meaning: string;
    classes: string;
    example: string;
    parenthesis?: string | null;
}

interface VocabularyPayload {
    word: string;
    past_tense: string | null;
    past_participle: string | null;
    rule: string;
    meanings: VocabularyMeaningPayload[];
}

export const createVocabulary = async (data: any): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;

    const payload: VocabularyPayload = {
        word: data.word.trim(),
        past_tense: data.past_tense?.trim() || null,
        past_participle: data.past_participle?.trim() || null,
        rule: data.rule,
        meanings: data.meanings
            .filter((m: any) => m.meaning.trim())
            .map((m: any) => ({
                meaning: m.meaning.trim(),
                classes: m.classes?.trim() || '기타',
                example: m.example?.trim() || '-',
                parenthesis: m.parenthesis?.trim() || null
            }))
    };

    const response = await apiClient.post<Vocabulary>('/vocabulary/', payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateVocabulary = async (vocabularyId: number, data: any): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;

    const payload: VocabularyPayload = {
        word: data.word.trim(),
        past_tense: data.past_tense?.trim() || null,
        past_participle: data.past_participle?.trim() || null,
        rule: data.rule,
        meanings: data.meanings
            .filter((m: any) => m.meaning.trim())
            .map((m: any) => ({
                meaning: m.meaning.trim(),
                classes: m.classes?.trim() || '기타',
                example: m.example?.trim() || '-',
                parenthesis: m.parenthesis?.trim() || null
            }))
    };

    const response = await apiClient.put<Vocabulary>(`/vocabulary/${vocabularyId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteVocabulary = async (vocabularyId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await apiClient.delete(`/vocabulary/${vocabularyId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};