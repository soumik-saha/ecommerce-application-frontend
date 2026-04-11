import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types';

const BASE_URL = 'http://localhost:8081';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/login`, data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/register`, data);
    return response.data;
  },

  async refreshToken(token: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/refresh`, { refreshToken: token });
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${BASE_URL}/api/auth/logout`);
  },
};
