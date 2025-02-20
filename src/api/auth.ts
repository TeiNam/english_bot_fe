// src/api/auth.ts
import axios from 'axios';
import axiosClient from './axiosClient';
import { AuthResponse, LoginCredentials } from '../types/auth';
import { useAuthStore } from '../store/authStore';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await axiosClient.post<AuthResponse>(
            '/auth/login',
            {
                email: credentials.email,
                password: credentials.password
            }
        );

        const { data } = response;

        if (data && data.access_token && data.user) {
            const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
            useAuthStore.getState().setAuth(data.access_token, data.user, tokenExpiry);
            return data;
        }

        throw new Error('로그인 응답이 올바르지 않습니다.');
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            }
        }

        throw new Error('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
};