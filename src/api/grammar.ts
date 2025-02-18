import axiosClient from './axiosClient';
import { Grammar, GrammarResponse } from '../types/grammar';

export const getGrammars = async (page: number = 1, size: number = 10): Promise<GrammarResponse> => {
    const response = await axiosClient.get<GrammarResponse>('/grammar/', {
        params: { page, size }
    });
    return response.data;
};

export const getGrammar = async (grammarId: number): Promise<Grammar> => {
    const response = await axiosClient.get<Grammar>(`/grammar/${grammarId}`);
    return response.data;
};

export const createGrammar = async (data: Partial<Grammar>): Promise<Grammar> => {
    const response = await axiosClient.post<Grammar>('/grammar/', data);
    return response.data;
};

export const updateGrammar = async (grammarId: number, data: Partial<Grammar>): Promise<Grammar> => {
    const response = await axiosClient.put<Grammar>(`/grammar/${grammarId}`, data);
    return response.data;
};

export const deleteGrammar = async (grammarId: number): Promise<void> => {
    await axiosClient.delete(`/grammar/${grammarId}`);
};