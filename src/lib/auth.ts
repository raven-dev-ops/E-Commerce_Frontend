// src/lib/auth.ts
import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL;

export async function loginWithEmailPassword(email: string, password: string) {
  const response = await axios.post(`${BASE_URL}/authentication/login/`, {
    email,
    password,
  });
  return response.data;
}
