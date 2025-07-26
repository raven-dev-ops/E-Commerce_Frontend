// src/lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// 1. Strip trailing slash
let base = rawBase.replace(/\/$/, '');
// 2. Force https://
if (base.startsWith('http://')) {
  base = base.replace(/^http:\/\//, 'https://');
}
// 3. Ensure `/api` is part of the path
if (!base.endsWith('/api')) {
  base = `${base}/api`;
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
      const token = localStorage.getItem('accessToken');
      if (token) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};
