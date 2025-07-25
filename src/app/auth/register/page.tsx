"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import GoogleAuthButton from '@/components/GoogleAuthButton';

function isAxiosError(error: unknown): error is { response?: { data?: { detail?: string } } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || '';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password1: '',
    password2: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { login, isAuthenticated } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (form.password1 !== form.password2) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register/', {
        email: form.email,
        password: form.password1,
      });
      router.push('/auth/login');
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else if (err instanceof Error) {
        setErrorMsg(`Registration failed: ${err.message}`);
      } else {
        setErrorMsg('An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`${BASE_URL}/users/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: credential }),
      });

      if (!response.ok) throw new Error('Google login failed');

      const data = await response.json();
      // Store JWTs
      localStorage.setItem('accessToken', data.access ?? '');
      localStorage.setItem('refreshToken', data.refresh ?? '');
      login(data.user || {});
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <GoogleAuthButton
        text="Register with Google"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
      <div className="text-center text-gray-500 my-2">or</div>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Email
          <input
            name="email"
            type="email"
            required
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label className="block mb-2">
          Password
          <input
            name="password1"
            type="password"
            required
            className="w-full border p-2 rounded"
            value={form.password1}
            onChange={handleChange}
          />
        </label>
        <label className="block mb-2">
          Confirm Password
          <input
            name="password2"
            type="password"
            required
            className="w-full border p-2 rounded"
            value={form.password2}
            onChange={handleChange}
          />
        </label>
        {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <a href="/auth/login" className="text-blue-700 underline">Login</a>
      </div>
    </div>
  );
}
