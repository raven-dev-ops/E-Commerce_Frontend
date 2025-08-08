// src/lib/auth.ts

import { api } from '@/lib/api';

export interface JwtLoginResponse {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  user?: Record<string, any>;
}

export interface DrfTokenLoginResponse {
  key?: string;
  token?: string;
  user?: Record<string, any>;
}

export async function loginWithJwt(email: string, password: string): Promise<JwtLoginResponse> {
  const { data } = await api.post<JwtLoginResponse>('/auth/login/', { email, password });
  return data;
}

export async function loginWithDrfToken(email: string, password: string): Promise<DrfTokenLoginResponse> {
  const { data } = await api.post<DrfTokenLoginResponse>('/authentication/login/', { email, password });
  return data;
}
