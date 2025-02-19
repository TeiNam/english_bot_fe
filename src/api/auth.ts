import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { config } from '../config';
import { useAuthStore } from '../store/authStore';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${config.apiUrl}/api/v1/auth/login`, credentials);
    if (response.data.access_token) {
      useAuthStore.getState().setAuth(response.data.access_token, response.data.user);
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
  }
};