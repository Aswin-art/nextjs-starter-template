import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  plugins: [nextCookies()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});
