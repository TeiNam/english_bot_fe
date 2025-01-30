import axios from 'axios';
import { LoginCredentials, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:8000'; // Update with your actual API URL

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};