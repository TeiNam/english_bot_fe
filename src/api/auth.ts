import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${config.apiUrl}/api/v1/auth/login`, credentials);
    const { data } = response;

    if (data?.access_token) {
      const expiresIn = data?.expires_in || 7 * 24 * 60 * 60; // Default to 7 days if not provided
      const tokenExpiry = Date.now() + (expiresIn * 1000);
      useAuthStore.getState().setAuth(data.access_token, data.user, tokenExpiry);
      return data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Login failed:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    throw new Error('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};