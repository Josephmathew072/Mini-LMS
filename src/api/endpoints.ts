import apiClient from './client';
import type { ApiResponse, User } from '../types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// FreeAPI actual response shape:
// { statusCode, success, message, data: { user, accessToken, refreshToken } } }

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    const res = await apiClient.post<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    >('/users/login', { email, password });

    return {
      user: res.data.data.user,
      accessToken: res.data.data.accessToken ?? '',
      refreshToken: res.data.data.refreshToken ?? '',
    };
  },

  register: async (
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    const res = await apiClient.post<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    >('/users/register', { username, email, password });

    return {
      user: res.data.data.user,
      accessToken: res.data.data.accessToken ?? '',
      refreshToken: res.data.data.refreshToken ?? '',
    };
  },
};

export const coursesApi = {
  // FreeAPI shape: { data: { data: [...], page, limit, totalPages } }
  fetchInstructors: async (limit = 30): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get(`/public/randomusers?limit=${limit}`);
    return res.data?.data?.data ?? res.data?.data ?? [];
  },

  fetchProducts: async (limit = 30): Promise<Record<string, unknown>[]> => {
    const res = await apiClient.get(`/public/randomproducts?limit=${limit}`);
    return res.data?.data?.data ?? res.data?.data ?? [];
  },
};
