import { getOptionalPublicEnv } from '@/lib/env';

type LogLevel = 'error' | 'warn' | 'info';

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
  url?: string;
  userAgent?: string;
};

const isEnabled = () => {
  const flag = getOptionalPublicEnv('NEXT_PUBLIC_LOGGING_ENABLED').toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
};

const getEndpoint = () => getOptionalPublicEnv('NEXT_PUBLIC_LOGGING_ENDPOINT').trim();

const buildError = (error: unknown) => {
  if (!error) return undefined;
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: typeof error === 'string' ? error : 'Unknown error' };
};

const buildPayload = (
  level: LogLevel,
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): LogPayload => ({
  level,
  message,
  timestamp: new Date().toISOString(),
  context,
  error: buildError(error),
  url: typeof window !== 'undefined' ? window.location.href : undefined,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
});

const sendPayload = async (payload: LogPayload) => {
  const endpoint = getEndpoint();
  if (!endpoint || !isEnabled()) return;
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(endpoint, body);
      return;
    }
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Swallow logging errors to avoid cascading failures.
  }
};

export const logError = (error: unknown, context?: Record<string, unknown>) => {
  void sendPayload(buildPayload('error', 'Unhandled error', error, context));
};

export const logInfo = (message: string, context?: Record<string, unknown>) => {
  void sendPayload(buildPayload('info', message, undefined, context));
};
