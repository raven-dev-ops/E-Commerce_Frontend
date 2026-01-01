import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const apiOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
})();

const apiHost = (() => {
  if (!apiOrigin) return '';
  try {
    return new URL(apiOrigin).hostname;
  } catch {
    return '';
  }
})();

const imageRemotePatterns = [
  apiHost
    ? { protocol: 'https', hostname: apiHost }
    : null,
  apiHost
    ? { protocol: 'http', hostname: apiHost }
    : null,
  { protocol: 'https', hostname: '*.googleusercontent.com' },
].filter(Boolean) as { protocol: 'http' | 'https'; hostname: string }[];

const wsOrigin = apiOrigin
  ? apiOrigin.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
  : '';

const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    !isProd ? "'unsafe-eval'" : '',
    'https://js.stripe.com',
    'https://accounts.google.com',
    'https://apis.google.com',
  ]
    .filter(Boolean)
    .join(' '),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://*.stripe.com",
  [
    "connect-src 'self'",
    apiOrigin,
    wsOrigin,
    'https://api.stripe.com',
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://accounts.google.com',
    'https://*.googleapis.com',
    'https://*.stripe.com',
  ]
    .filter(Boolean)
    .join(' '),
  "frame-src https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
  "font-src 'self' https://fonts.gstatic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

if (isProd) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: imageRemotePatterns,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

