// src/lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthStorage,
  getAuthTokens,
  getAuthorizationHeader,
  setAuthTokens,
  type AuthTokens,
} from '@/lib/authStorage';
import { getBaseUrl } from '@/lib/baseUrl';

const base = getBaseUrl();
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

export const api: AxiosInstance = axios.create({
  baseURL: base,
  headers: DEFAULT_HEADERS,
  timeout: 15000,
});

type RefreshResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  key?: string;
  token?: string;
};

const REFRESH_ENDPOINTS = [
  '/auth/refresh/',
  '/authentication/refresh/',
  '/auth/token/refresh/',
  '/authentication/token/refresh/',
];

const AUTH_SKIP_PATHS = [
  '/auth/login/',
  '/authentication/login/',
  '/auth/registration/',
  '/authentication/register/',
  '/auth/google/login/',
  '/auth/refresh/',
  '/authentication/refresh/',
];

const refreshClient = axios.create({
  baseURL: base,
  headers: DEFAULT_HEADERS,
  timeout: 15000,
});

let refreshPromise: Promise<AuthTokens | null> | null = null;

const extractTokens = (data: RefreshResponse): AuthTokens => {
  const access = data.access ?? data.access_token;
  const refresh = data.refresh ?? data.refresh_token;
  const drfToken = data.key ?? data.token;
  const tokens: AuthTokens = {};
  if (typeof access === 'string' && access.trim()) tokens.accessToken = access;
  if (typeof refresh === 'string' && refresh.trim()) tokens.refreshToken = refresh;
  if (typeof drfToken === 'string' && drfToken.trim()) tokens.drfToken = drfToken;
  return tokens;
};

const shouldSkipAuthHandling = (config?: InternalAxiosRequestConfig) => {
  if (!config?.url) return false;
  return AUTH_SKIP_PATHS.some((path) => config.url?.includes(path));
};

const attemptRefresh = async (refreshToken: string): Promise<AuthTokens | null> => {
  for (const endpoint of REFRESH_ENDPOINTS) {
    try {
      const { data } = await refreshClient.post<RefreshResponse>(endpoint, {
        refresh: refreshToken,
        refresh_token: refreshToken,
      });
      const tokens = extractTokens(data);
      if (tokens.accessToken || tokens.drfToken) {
        if (!tokens.refreshToken) tokens.refreshToken = refreshToken;
        return tokens;
      }
    } catch {
      // Try the next endpoint.
    }
  }
  return null;
};

const refreshAuthTokens = async () => {
  if (refreshPromise) return refreshPromise;
  const { refreshToken } = getAuthTokens();
  if (!refreshToken) return null;
  refreshPromise = attemptRefresh(refreshToken);
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    const authHeader = getAuthorizationHeader();
    if (authHeader) {
      (config.headers as Record<string, string>)['Authorization'] = authHeader;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalConfig = error?.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (status === 401 && originalConfig && !shouldSkipAuthHandling(originalConfig)) {
      if (!originalConfig._retry) {
        const refreshed = await refreshAuthTokens();
        if (refreshed?.accessToken || refreshed?.drfToken) {
          setAuthTokens(refreshed, { silent: true });
          originalConfig._retry = true;
          originalConfig.headers = originalConfig.headers ?? {};
          const header = refreshed.accessToken
            ? `Bearer ${refreshed.accessToken}`
            : refreshed.drfToken
              ? `Token ${refreshed.drfToken}`
              : undefined;
          if (header) {
            (originalConfig.headers as Record<string, string>)['Authorization'] = header;
          }
          return api(originalConfig);
        }
      }

      const tokens = getAuthTokens();
      if (tokens.accessToken || tokens.drfToken || tokens.refreshToken) {
        clearAuthStorage();
      }
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed.') => {
  const err = error as { response?: { data?: unknown } };
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    const nonFieldErrors = (data as { non_field_errors?: unknown }).non_field_errors;
    if (Array.isArray(nonFieldErrors)) {
      const first = nonFieldErrors[0];
      if (typeof first === 'string' && first.trim()) return first;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

// helper to clear out the saved tokens on logout
export const logout = () => {
  clearAuthStorage();
};
