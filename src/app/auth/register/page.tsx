"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

import { registerWithEmailPassword } from '@/lib/auth';

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
  const { isAuthenticated, authHydrated } = useStore();
  const errorId = 'register-form-error';
  const infoId = 'register-form-info';
  const describedBy = [errorMsg ? errorId : null, infoMsg ? infoId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  useEffect(() => {
    if (authHydrated && isAuthenticated) {
      router.push('/');
    }
  }, [authHydrated, isAuthenticated, router]);

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
      await registerWithEmailPassword(form.email, form.password1);
      setInfoMsg('Registration successful. Please check your email to verify your account.');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} aria-describedby={describedBy}>
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
        {errorMsg && (
          <div id={errorId} role="alert" aria-live="assertive" className="text-red-600 mb-2">
            {errorMsg}
          </div>
        )}
        {infoMsg && (
          <div id={infoId} role="status" aria-live="polite" className="text-green-600 mb-2">
            {infoMsg}
          </div>
        )}
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
