// src/lib/auth.ts

import { api } from '@/lib/api';
import type { AuthSession, AuthTokens, AuthUser } from '@/lib/authStorage';

type AuthResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  key?: string;
  token?: string;
  user?: AuthUser;
};

const getErrorMessage = (error: unknown, fallback: string) => {
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
  return fallback;
};

const normalizeAuthSession = (data: AuthResponse, fallbackEmail?: string): AuthSession => {
  const access = data.access ?? data.access_token;
  const refresh = data.refresh ?? data.refresh_token;
  const drfToken = data.key ?? data.token;
  const user = data.user ?? (fallbackEmail ? { email: fallbackEmail } : null);

  const tokens: AuthTokens = {
    accessToken: access,
    refreshToken: refresh,
    drfToken,
  };

  return {
    tokens,
    user,
    tokenType: access ? 'jwt' : drfToken ? 'drf' : 'unknown',
  };
};

type SafePostSuccess<T> = { ok: true; data: T };
type SafePostFailure = { ok: false; error: unknown };

const safePost = async <T>(
  url: string,
  payload: Record<string, unknown>
): Promise<SafePostSuccess<T> | SafePostFailure> => {
  try {
    const { data } = await api.post<T>(url, payload);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
};

export async function loginWithEmailPassword(email: string, password: string): Promise<AuthSession> {
  const jwtAttempt = await safePost<AuthResponse>('/auth/login/', { email, password });
  if (jwtAttempt.ok) return normalizeAuthSession(jwtAttempt.data, email);

  const drfAttempt = await safePost<AuthResponse>('/authentication/login/', { email, password });
  if (drfAttempt.ok) return normalizeAuthSession(drfAttempt.data, email);

  const message = getErrorMessage(
    drfAttempt.error,
    getErrorMessage(jwtAttempt.error, 'Invalid credentials.')
  );
  throw new Error(message);
}

export async function registerWithEmailPassword(email: string, password: string): Promise<void> {
  const jwtAttempt = await safePost('/auth/registration/', {
    email,
    password1: password,
    password2: password,
  });
  if (jwtAttempt.ok) return;

  const drfAttempt = await safePost('/authentication/register/', { email, password });
  if (drfAttempt.ok) return;

  const message = getErrorMessage(
    drfAttempt.error,
    getErrorMessage(jwtAttempt.error, 'Registration failed.')
  );
  throw new Error(message);
}

export async function loginWithGoogle(code: string): Promise<AuthSession> {
  const attempt = await safePost<AuthResponse>('/auth/google/login/', {
    code,
    access_token: code,
  });
  if (!attempt.ok) {
    throw new Error(getErrorMessage(attempt.error, 'Google login failed.'));
  }
  return normalizeAuthSession(attempt.data);
}
