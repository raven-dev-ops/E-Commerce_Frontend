// src/lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// 1. Read raw env var (might be "", might end with "/" or start with "http://")
const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// 2. Strip any trailing slash
let base = rawBase.replace(/\/$/, '');

// 3. Force HTTPS if someone accidentally used http://
if (base.startsWith('http://')) {
  base = base.replace(/^http:\/\//, 'https://');
}

// 4. Ensure the path ends in /api/v1
if (!base.endsWith('/api/v1')) {
  // Normalize cases where base might already have /api
  if (base.endsWith('/api')) {
    base = `${base}/v1`;
  } else {
    base = `${base}/api/v1`;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: base,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    if (typeof window !== 'undefined') {
      // Prefer JWT for endpoints that require it; fallback to DRF Token
      const jwt = localStorage.getItem('accessToken');
      const drfToken = localStorage.getItem('drfToken');
      if (jwt) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${jwt}`;
      } else if (drfToken) {
        (config.headers as Record<string, string>)['Authorization'] = `Token ${drfToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// helper to clear out the saved tokens on logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('drfToken');
  }
};
