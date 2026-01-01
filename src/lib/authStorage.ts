export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
  drfToken?: string;
};

export type AuthUser = (Record<string, unknown> & { email?: string; username?: string }) | null;

export type AuthSession = {
  tokens: AuthTokens;
  user: AuthUser;
  tokenType: 'jwt' | 'drf' | 'unknown';
};

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  drfToken: 'drfToken',
  user: 'authUser',
};

const AUTH_EVENT = 'auth:changed';

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const emitAuthChange = () => {
  if (!canUseStorage()) return;
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
};

export const onAuthChange = (handler: () => void) => {
  if (!canUseStorage()) return () => {};
  window.addEventListener(AUTH_EVENT, handler);
  return () => window.removeEventListener(AUTH_EVENT, handler);
};

export const getAuthTokens = (): AuthTokens => {
  if (!canUseStorage()) return {};
  return {
    accessToken: localStorage.getItem(STORAGE_KEYS.accessToken) || undefined,
    refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken) || undefined,
    drfToken: localStorage.getItem(STORAGE_KEYS.drfToken) || undefined,
  };
};

export const setAuthTokens = (tokens: AuthTokens, options?: { silent?: boolean }) => {
  if (!canUseStorage()) return;
  if (tokens.accessToken) localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  else localStorage.removeItem(STORAGE_KEYS.accessToken);

  if (tokens.refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  else localStorage.removeItem(STORAGE_KEYS.refreshToken);

  if (tokens.drfToken) localStorage.setItem(STORAGE_KEYS.drfToken, tokens.drfToken);
  else localStorage.removeItem(STORAGE_KEYS.drfToken);

  if (!options?.silent) emitAuthChange();
};

export const getStoredUser = (): AuthUser => {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser, options?: { silent?: boolean }) => {
  if (!canUseStorage()) return;
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.user);

  if (!options?.silent) emitAuthChange();
};

export const setAuthSession = (session: AuthSession) => {
  setAuthTokens(session.tokens, { silent: true });
  setStoredUser(session.user, { silent: true });
  emitAuthChange();
};

export const clearAuthStorage = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.drfToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  emitAuthChange();
};

export const hasAuthTokens = () => {
  const tokens = getAuthTokens();
  return Boolean(tokens.accessToken || tokens.drfToken);
};

export const getAuthorizationHeader = () => {
  const tokens = getAuthTokens();
  if (tokens.accessToken) return `Bearer ${tokens.accessToken}`;
  if (tokens.drfToken) return `Token ${tokens.drfToken}`;
  return undefined;
};

export const getAuthSession = (): AuthSession => {
  const tokens = getAuthTokens();
  return {
    tokens,
    user: getStoredUser(),
    tokenType: tokens.accessToken ? 'jwt' : tokens.drfToken ? 'drf' : 'unknown',
  };
};
