'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logError } from '@/lib/logger';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    logError(error, { digest: error.digest });
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error('Global error boundary caught:', error);
    }
  }, [error, isDev]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="mb-3 text-3xl font-bold">Something went wrong</h1>
      <p className="mb-6 text-gray-600">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      {isDev && (
        <div className="mb-6 w-full rounded border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
          <p className="font-semibold">Error details (dev only)</p>
          <p className="mt-2 break-words">{error.message}</p>
          {error.digest && <p className="mt-1 text-xs text-red-500">Digest: {error.digest}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded border border-gray-300 px-4 py-2">
          Go home
        </Link>
      </div>
    </div>
  );
}
