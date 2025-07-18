// frontend/src/types/next-auth.d.ts

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    /** JWT access token for API calls */
    accessToken?: string;
    /** Optionally, attach the user id or more */
    user?: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      /** Add more custom fields here if needed */
      [key: string]: unknown;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    /** Access token or custom token, e.g. from backend JWT */
    accessToken?: string;
    /** Optionally add more fields */
    [key: string]: unknown;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** Persist the access token here */
    accessToken?: string;
    /** User id if available */
    id?: string;
    /** Add more custom JWT claims as needed */
    [key: string]: unknown;
  }
}
