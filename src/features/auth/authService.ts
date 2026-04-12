import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types';
import { logger } from '../../utils/logger';

const BASE_URL = 'http://localhost:8081';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    logger.info('Auth login requested', { email: data.email });
    try {
      const response = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/login`, data);
      logger.info('Auth login succeeded', {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
      });
      return response.data;
    } catch (error) {
      logger.error('Auth login failed', error, { email: data.email });
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    logger.info('Auth registration requested', { email: data.email });
    try {
      const response = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/register`, data);
      logger.info('Auth registration succeeded', {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
      });
      return response.data;
    } catch (error) {
      logger.error('Auth registration failed', error, { email: data.email });
      throw error;
    }
  },

  async refreshToken(token: string): Promise<AuthResponse> {
    logger.debug('Auth refresh requested');
    try {
      const response = await axios.post<AuthResponse>(`${BASE_URL}/api/auth/refresh`, { refreshToken: token });
      logger.info('Auth refresh succeeded', {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
      });
      return response.data;
    } catch (error) {
      logger.error('Auth refresh failed', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    logger.info('Auth logout requested');
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`);
      logger.info('Auth logout succeeded');
    } catch (error) {
      logger.error('Auth logout failed', error);
      throw error;
    }
  },
};
