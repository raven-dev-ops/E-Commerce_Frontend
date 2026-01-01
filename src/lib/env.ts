type EnvName =
  | 'NEXT_PUBLIC_API_BASE_URL'
  | 'NEXT_PUBLIC_SITE_URL'
  | 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY'
  | 'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
  | 'NEXT_PUBLIC_LOGGING_ENABLED'
  | 'NEXT_PUBLIC_LOGGING_ENDPOINT';

const PUBLIC_ENV: Record<EnvName, string | undefined> = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_LOGGING_ENABLED: process.env.NEXT_PUBLIC_LOGGING_ENABLED,
  NEXT_PUBLIC_LOGGING_ENDPOINT: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
};

export const requirePublicEnv = (name: EnvName): string => {
  const value = PUBLIC_ENV[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Set it in .env or your deployment environment.`
    );
  }
  return value;
};

export const getOptionalPublicEnv = (name: EnvName, fallback = ''): string =>
  PUBLIC_ENV[name] || fallback;
