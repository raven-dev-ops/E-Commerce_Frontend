// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Helper to authenticate users (replace with your backend logic)
async function authenticateWithBackend(email: string, password: string) {
  // Example: POST to your backend API
  const res = await fetch(`${process.env.BACKEND_URL}/authentication/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { id: data.user.id, email: data.user.email, ...data.user }; // customize as needed
}

// Make sure to type your options as NextAuthOptions for proper TS checking!
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await authenticateWithBackend(credentials.email, credentials.password);
        if (user) return user;
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add other providers here if needed
  ],
  session: {
    strategy: "jwt", // FIX: now matches SessionStrategy type
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
