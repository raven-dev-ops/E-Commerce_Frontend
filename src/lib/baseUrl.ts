// src/lib/baseUrl.ts
export function getBaseUrl() {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://');
  if (!raw.endsWith('/api/v1')) {
    if (raw.endsWith('/api')) raw = `${raw}/v1`;
    else raw = `${raw}/api/v1`;
  }
  return raw;
}
  