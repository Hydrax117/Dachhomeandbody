import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

type UserRole = "CUSTOMER" | "STAFF" | "ADMIN"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
  }
}

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Credentials provider for email/password authentication
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const validatedCredentials = credentialsSchema.parse(credentials)

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: validatedCredentials.email },
          })

          // Check if user exists and has a password (not OAuth-only user)
          if (!user || !user.password) {
            return null
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(
            validatedCredentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Return user object (password excluded)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),

    // Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth to existing email accounts
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name
        token.email = session.email
      }

      return token
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure user has a role
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          // If user doesn't exist, they'll be created by the adapter
          // If user exists but doesn't have a role, update it
          if (existingUser && !existingUser.role) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role: "CUSTOMER" },
            })
          }
        } catch (error) {
          console.error("Error during OAuth sign in:", error)
          return false
        }
      }

      return true
    },
  },
  events: {
    async linkAccount({ user }) {
      // When an OAuth account is linked, verify email
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
})
