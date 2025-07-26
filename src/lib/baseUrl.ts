// src/lib/baseUrl.ts
export function getBaseUrl() {
    let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    if (raw.startsWith("http://")) raw = raw.replace(/^http:\/\//, "https://");
    return raw;
  }
  