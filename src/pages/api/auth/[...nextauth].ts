// pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Helper for backend authentication
async function authenticateWithBackend(email: string, password: string) {
  const res = await fetch(`${process.env.BACKEND_URL}/authentication/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { id: data.user.id, email: data.user.email, ...data.user };
}

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
        return await authenticateWithBackend(credentials.email, credentials.password);
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add other providers as needed
  ],
  session: {
    strategy: "jwt", // Do NOT use a raw string, this must be the literal "jwt"
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    signOut: "/auth/logout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
