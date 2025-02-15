import axios from 'axios';
import { Prompt, PromptResponse } from '../types/prompt';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

export const getPrompts = async (): Promise<Prompt[]> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Prompt[]>(`${API_URL}/api/v1/chat/prompts/templates`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getPrompt = async (promptId: number): Promise<Prompt> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Prompt>(`${API_URL}/api/v1/chat/prompts/templates/${promptId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createPrompt = async (data: Partial<Prompt>): Promise<Prompt> => {
    const token = useAuthStore.getState().token;
    const response = await axios.post<Prompt>(`${API_URL}/api/v1/chat/prompts/templates`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updatePrompt = async (promptId: number, data: Partial<Prompt>): Promise<Prompt> => {
    const token = useAuthStore.getState().token;
    const response = await axios.put<Prompt>(`${API_URL}/api/v1/chat/prompts/templates/${promptId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};