"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '') + '/api/v1';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { login, isAuthenticated } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1) Try dj-rest-auth JWT login
      const jwtRes = await fetch(`${BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (jwtRes.ok) {
        const data = await jwtRes.json();
        localStorage.setItem('accessToken', data.access ?? data.access_token ?? '');
        if (data.refresh ?? data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh ?? data.refresh_token);
        }
        login(data.user || {});
        router.push('/');
        return;
      }

      // 2) Fallback to custom Token auth
      const tokenRes = await fetch(`${BASE_URL}/authentication/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const tokenData = await tokenRes.json();
      // Expect token in { key } or { token }
      const token = tokenData.key ?? tokenData.token ?? '';
      localStorage.setItem('drfToken', token);
      login(tokenData.user || {});
      router.push('/');
    } catch (error: any) {
      setErrorMsg(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Email
          <input
            type="email"
            required
            className="w-full border p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="block mb-2">
          Password
          <input
            type="password"
            required
            className="w-full border p-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {errorMsg && <div className="text-red-600 text-sm mb-2">{errorMsg}</div>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center text-gray-600">
        Need an account?{' '}
        <a href="/auth/register" className="text-blue-700 underline">Register</a>
      </div>
    </div>
  );
}
