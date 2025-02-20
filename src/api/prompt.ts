import axiosClient from './axiosClient';
import {Prompt} from '../types/prompt';

export const getPrompts = async (): Promise<Prompt[]> => {
    const response = await axiosClient.get<Prompt[]>('/chat/prompts/templates');
    return response.data;
};

export const getPrompt = async (promptId: number): Promise<Prompt> => {
    const response = await axiosClient.get<Prompt>(`/chat/prompts/templates/${promptId}`);
    return response.data;
};

export const createPrompt = async (data: Partial<Prompt>): Promise<Prompt> => {
    const response = await axiosClient.post<Prompt>('/chat/prompts/templates', data);
    return response.data;
};

export const updatePrompt = async (promptId: number, data: Partial<Prompt>): Promise<Prompt> => {
    const response = await axiosClient.put<Prompt>(`/chat/prompts/templates/${promptId}`, data);
    return response.data;
};

export const deletePrompt = async (promptId: number): Promise<void> => {
    await axiosClient.delete(`/chat/prompts/templates/${promptId}`);
};