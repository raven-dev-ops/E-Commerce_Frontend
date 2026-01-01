import { getAuthTokens } from '@/lib/authStorage';
import { requirePublicEnv } from '@/lib/env';

const stripApiSuffix = (raw: string) => raw.replace(/\/api\/v1$/, '').replace(/\/api$/, '');

const toWsBase = (raw: string) => {
  if (raw.startsWith('https://')) return raw.replace(/^https:\/\//, 'wss://');
  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'ws://');
  return raw;
};

export const getWsBaseUrl = () => {
  let raw = requirePublicEnv('NEXT_PUBLIC_API_BASE_URL').replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production' && raw.startsWith('http://')) {
    raw = raw.replace(/^http:\/\//, 'https://');
  }
  raw = stripApiSuffix(raw);
  return toWsBase(raw);
};

export const buildOrdersWsUrl = (orderId: string | number) => {
  const base = getWsBaseUrl();
  const url = new URL(`${base}/ws/orders/${orderId}/`);
  const tokens = getAuthTokens();
  if (tokens.accessToken) {
    url.searchParams.set('access', tokens.accessToken);
  }
  if (tokens.drfToken) {
    url.searchParams.set('token', tokens.drfToken);
  }
  return url.toString();
};
