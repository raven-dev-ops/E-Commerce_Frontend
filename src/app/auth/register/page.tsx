"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

function isAxiosError(error: unknown): error is { response?: { data?: any } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password1: '',
    password2: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form.password1 !== form.password2) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/register/', {
        email: form.email,
        password: form.password1,
      });
      router.push('/auth/login');
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        setErrorMsg(detail || 'Registration failed');
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Registration failed');
      }
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
          className="w-full px-4 py-2 bg-green-600 text-white rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}
