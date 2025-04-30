// frontend/src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    /** Your JWT access token */
    access?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** Persist the access token here */
    access?: string;
  }
}
