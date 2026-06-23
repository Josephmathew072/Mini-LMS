// src/api/client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../services/storage';
import { STORAGE_KEYS } from '../utils/constants';

const BASE_URL = 'https://api.freeapi.app/api/v1';

// Exponential backoff delay: 1s, 2s, 4s
function retryDelay(attempt: number): number {
  return Math.pow(2, attempt) * 1000;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor — attach access token ──────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor — retry + token refresh + error normalisation ─────
// We track retry state via a custom field on the config object.
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _skipRetry?: boolean;
}

let isRefreshing = false;
// Queue of callbacks waiting for a refreshed token
let refreshQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null): void {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.log('API Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    const config = error.config as RetryConfig | undefined;

    // ── Network / timeout errors — retry up to 3 times ──────────────────────
    const isNetworkError = !error.response;
    const isTimeout = error.code === 'ECONNABORTED';
    const is5xx = (error.response?.status ?? 0) >= 500;
    const shouldRetry = (isNetworkError || isTimeout || is5xx) && !config?._skipRetry;

    if (shouldRetry && config) {
      const attempt = config._retryCount ?? 0;
      if (attempt < 3) {
        config._retryCount = attempt + 1;
        await sleep(retryDelay(attempt));
        return apiClient(config);
      }
    }

    // ── Normalise error for consumers ────────────────────────────────────────
    if (isTimeout) {
      return Promise.reject({
        message: 'Request timed out. Please try again.',
        status: 408,
      });
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    }

    // ── 401 — attempt token refresh once ────────────────────────────────────
    if (error.response.status === 401 && config && !config._skipRetry) {
      config._skipRetry = true; // prevent infinite refresh loops

      if (isRefreshing) {
        // Wait for the ongoing refresh to finish, then replay this request
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (!newToken || !config.headers) {
              reject({ message: 'Session expired. Please login again.', status: 401 });
              return;
            }
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(config));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        // FreeAPI refresh endpoint
        const refreshConfig = {
          headers: {},
          _skipRetry: true,
        } as RetryConfig;

        const res = await apiClient.post(
          '/users/refresh-token',
          { refreshToken },
          refreshConfig,
        );

        const newAccessToken = res.data.data.tokens.accessToken;
        const newRefreshToken = res.data.data.tokens.refreshToken;

        await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        flushQueue(newAccessToken);
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(config);
      } catch {
        // Refresh failed — clear everything and force logout
        await secureStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStorage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
        flushQueue(null);
        return Promise.reject({ message: 'Session expired. Please login again.', status: 401 });
      } finally {
        isRefreshing = false;
      }
    }

    const responseData = error.response.data as any;
    console.error(responseData?.message || responseData?.data?.message || error.message);

    return Promise.reject({
      message:
        responseData?.message ||
        responseData?.data?.message ||
        'Something went wrong.',
      status: error.response.status,
    });
  },
);

export default apiClient;
