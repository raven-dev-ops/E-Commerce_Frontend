// src/lib/auth.ts

import { api } from '@/lib/api';

export interface LoginResponse {
  token: string;
  user: Record<string, any>;
  // …extend with whatever your backend actually returns
}

/**
 * Logs in with email + password.
 * Uses our normalized `api` (so HTTPS is enforced, `/api` is appended, etc).
 */
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/authentication/login/', {
    email,
    password,
  });
  return data;
}
