// frontend/src/types/next-auth.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    /** Your JWT access token */
    access?: string;
  }
  interface User { token?: string; }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** Persist the access token here */
    access?: string;
  }
}
