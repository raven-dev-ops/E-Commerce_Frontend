import axios from 'axios';

export async function loginWithEmailPassword(email: string, password: string) {
  const response = await axios.post(`${process.env.BACKEND_URL}/authentication/login/`, {
    email,
    password,
  });
  return response.data;
}