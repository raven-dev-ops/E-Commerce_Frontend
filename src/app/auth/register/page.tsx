"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '') + '/api/v1';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password1: '',
    password2: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    if (form.password1 !== form.password2) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // 1) Try dj-rest-auth registration
      const res = await fetch(`${BASE_URL}/auth/registration/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password1: form.password1, password2: form.password2 }),
      });

      if (res.ok) {
        setInfoMsg('Registration successful. Please check your email to verify your account.');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      // 2) Fallback to custom auth register
      const res2 = await fetch(`${BASE_URL}/authentication/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password1 }),
      });

      if (!res2.ok) {
        const errorData = await res2.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed');
      }

      setInfoMsg('Registration successful. Please check your email to verify your account.');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (error: any) {
      setErrorMsg(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
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
            autoComplete="email"
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
            autoComplete="new-password"
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
            autoComplete="new-password"
          />
        </label>
        {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
        {infoMsg && <div className="text-green-600 mb-2">{infoMsg}</div>}
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
