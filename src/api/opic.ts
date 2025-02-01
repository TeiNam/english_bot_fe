import axios from 'axios';
import { Opic, OpicResponse, OpicCount, SectionType } from '../types/opic';
import { useAuthStore } from '../store/authStore';
import { config } from '../config';

const API_URL = config.apiUrl;

export const getOpics = async (
    page: number = 1,
    size: number = 10,
    section?: SectionType
): Promise<OpicResponse> => {
    const token = useAuthStore.getState().token;
    const params = { page, size, ...(section && { section }) };
    const response = await axios.get<OpicResponse>(`${API_URL}/api/v1/opic/`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getOpicCounts = async (): Promise<OpicCount> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<OpicCount>(`${API_URL}/api/v1/opic/count`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getOpic = async (opicId: number): Promise<Opic> => {
    const token = useAuthStore.getState().token;
    const response = await axios.get<Opic>(`${API_URL}/api/v1/opic/${opicId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createOpic = async (data: Partial<Opic>): Promise<Opic> => {
    const token = useAuthStore.getState().token;
    const response = await axios.post<Opic>(`${API_URL}/api/v1/opic/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateOpic = async (opicId: number, data: Partial<Opic>): Promise<Opic> => {
    const token = useAuthStore.getState().token;
    const response = await axios.put<Opic>(`${API_URL}/api/v1/opic/${opicId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteOpic = async (opicId: number): Promise<void> => {
    const token = useAuthStore.getState().token;
    await axios.delete(`${API_URL}/api/v1/opic/${opicId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};