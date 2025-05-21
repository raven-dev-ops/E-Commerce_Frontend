import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from '@/lib/api';

const handler = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Email / Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const resp = await api.post('/auth/login/', credentials);
        const user = resp.data.user;        // adjust to your /auth/login/ response
        const token = resp.data.tokens.access;
        if (user && token) {
          return { ...user, token };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.access = (user as any).token; // Type assertion if user type doesn't include token yet
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).access = (token as any).access; // Type assertion if session/token types don't include access yet
      return session;
    },
  },
});

export { handler as GET, handler as POST };