// src/lib/baseUrl.ts
import { requirePublicEnv } from '@/lib/env';

export function getBaseUrl() {
  let raw = requirePublicEnv('NEXT_PUBLIC_API_BASE_URL').replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production' && raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  if (!raw.endsWith('/api/v1')) {
    if (raw.endsWith('/api')) raw = `${raw}/v1`;
    else raw = `${raw}/api/v1`;
  }
  return raw;
}
  
