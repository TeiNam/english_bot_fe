// vocabulary.ts
import axios from 'axios';
import { Vocabulary, VocabularyResponse } from '../types/vocabulary';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
    baseURL: '/api',  // /api prefix 추가
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
    console.log('Fetching vocabularies:', { page, size });

    try {
        const response = await apiClient.get<VocabularyResponse>('/vocabulary/', {
            params: { page, size },
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching vocabularies:', error);
        throw error;
    }
};

export const getVocabulary = async (vocabularyId: number): Promise<Vocabulary> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<Vocabulary>(`/vocabulary/${vocabularyId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
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
                example: m.example?.trim() || '예문 없음',
                parenthesis: m.parenthesis?.trim() || null
            }))
    };

    const response = await apiClient.post<Vocabulary>('/vocabulary/', payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
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
                example: m.example?.trim() || '예문 없음',
                parenthesis: m.parenthesis?.trim() || null
            }))
    };

    const response = await apiClient.put<Vocabulary>(`/vocabulary/${vocabularyId}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    return response.data;
};

export const deleteVocabulary = async (vocabularyId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await apiClient.delete(`/vocabulary/${vocabularyId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
};