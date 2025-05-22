// frontend/src/lib/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'https://twiinz-beard-backend-11dfd7158830.herokuapp.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken'); // Or retrieve from your Zustand store
      if (token) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export { api };

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
};
