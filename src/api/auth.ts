import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { config } from '../config';

const API_URL = config.apiUrl;

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};