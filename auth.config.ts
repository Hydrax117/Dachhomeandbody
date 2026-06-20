/**
 * Edge-compatible auth configuration.
 *
 * This file must NOT import anything that uses Node.js APIs (Prisma, bcrypt,
 * etc.) because it is consumed by the middleware which runs in the Edge
 * runtime. Heavy providers and the Prisma adapter are added in lib/auth.ts
 * which only runs in the Node.js runtime.
 */
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "CUSTOMER" | "STAFF" | "ADMIN"
      }
      return session
    },
  },
}
