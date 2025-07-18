"use client";

import { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { loginWithEmailPassword } from '@/lib/auth';
import { useStore } from '@/store/useStore';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { login, isAuthenticated } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      redirect('/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { token, user } = await loginWithEmailPassword(email, password);
      localStorage.setItem('accessToken', token);
      login(user);
      router.push('/');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('https://twiinz-beard-backend-11dfd7158830.herokuapp.com/users/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: credential }),
      });

      if (!response.ok) throw new Error('Google login failed');

      const data = await response.json();
      // Handle backend JWT/token & user
      localStorage.setItem('accessToken', data.access_token ?? '');
      login(data.user || {}); // update your state/store with user
      router.push('/');
    } catch (error: any) {
      setErrorMsg('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    setErrorMsg(error || 'Google login failed');
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
      <div className="my-4">
        <GoogleAuthButton
          text="Continue with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
      <div className="mt-4 text-center text-gray-600">
        Need an account?{' '}
        <a href="/auth/register" className="text-blue-700 underline">Register</a>
      </div>
    </div>
  );
}
