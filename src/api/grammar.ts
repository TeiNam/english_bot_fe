import axios from 'axios';
import { Grammar, GrammarResponse } from '../types/grammar';
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

export const getGrammars = async (page: number = 1, size: number = 10): Promise<GrammarResponse> => {
    const token = useAuthStore.getState().token;
    const skip = (page - 1) * size;
    const response = await apiClient.get<GrammarResponse>('/api/v1/grammar/', {
        params: { skip, limit: size },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getGrammar = async (grammarId: number): Promise<Grammar> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.get<Grammar>(`/api/v1/grammar/${grammarId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createGrammar = async (data: Partial<Grammar>): Promise<Grammar> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.post<Grammar>('/api/v1/grammar/', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateGrammar = async (grammarId: number, data: Partial<Grammar>): Promise<Grammar> => {
    const token = useAuthStore.getState().token;
    const response = await apiClient.put<Grammar>(`/api/v1/grammar/${grammarId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteGrammar = async (grammarId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await apiClient.delete(`/api/v1/grammar/${grammarId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};