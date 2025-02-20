import axiosClient from './axiosClient';
import {Opic, OpicCount, OpicResponse, SectionType} from '../types/opic';

export const getOpics = async (
    page: number = 1,
    size: number = 10,
    section?: SectionType
): Promise<OpicResponse> => {
    const params = {page, size, ...(section && {section})};
    const response = await axiosClient.get<OpicResponse>('/opic/', {
        params
    });
    return response.data;
};

export const getOpicCounts = async (): Promise<OpicCount> => {
    const response = await axiosClient.get<OpicCount>('/opic/count');
    return response.data;
};

export const getOpic = async (opicId: number): Promise<Opic> => {
    const response = await axiosClient.get<Opic>(`/opic/${opicId}`);
    return response.data;
};

export const createOpic = async (data: Partial<Opic>): Promise<Opic> => {
    const response = await axiosClient.post<Opic>('/opic/', data);
    return response.data;
};

export const updateOpic = async (opicId: number, data: Partial<Opic>): Promise<Opic> => {
    const response = await axiosClient.put<Opic>(`/opic/${opicId}`, data);
    return response.data;
};

export const deleteOpic = async (opicId: number): Promise<void> => {
    await axiosClient.delete(`/opic/${opicId}`);
};