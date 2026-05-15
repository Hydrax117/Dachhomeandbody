"use server"

import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { sendPasswordResetEmail } from "@/lib/email"
import {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/app/actions/auth.schemas"

export type RegisterFormState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  success?: boolean
}

export type LoginFormState = {
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  success?: boolean
  isAdmin?: boolean
}

export type RequestPasswordResetFormState = {
  errors?: {
    email?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export type ResetPasswordFormState = {
  errors?: {
    token?: string[]
    password?: string[]
    _form?: string[]
  }
  success?: boolean
}

/**
 * Register a new user with email and password
 * Hashes the password using bcrypt before storing
 */
export async function register(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  try {
    // Validate form data
    const validatedFields = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validatedFields.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
      }
    }

    // Hash password using bcrypt with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    })

    // Automatically sign in the user after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      errors: {
        _form: ["An error occurred during registration. Please try again."],
      },
    }
  }
}

/**
 * Sign in a user with email and password
 */
export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  try {
    // Validate form data
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    // Attempt to sign in
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    // Check if the user is an admin so the client can redirect appropriately
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })

    return { success: true, isAdmin: user?.role === "ADMIN" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            errors: {
              _form: ["Invalid email or password"],
            },
          }
        default:
          return {
            errors: {
              _form: ["An error occurred during login. Please try again."],
            },
          }
      }
    }
    throw error
  }
}

/**
 * Request a password reset email
 * Generates a secure token and sends reset email
 */
export async function requestPasswordReset(
  _prevState: RequestPasswordResetFormState,
  formData: FormData
): Promise<RequestPasswordResetFormState> {
  try {
    // Validate form data
    const validatedFields = requestPasswordResetSchema.safeParse({
      email: formData.get("email"),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email } = validatedFields.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      }
    }

    // Generate cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex")

    // Hash the token before storing (additional security layer)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store hashed token and expiry in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    })

    // Send password reset email with the unhashed token
    const emailResult = await sendPasswordResetEmail(
      email,
      resetToken,
      user.name
    )

    if (!emailResult.success) {
      return {
        errors: {
          _form: ["Failed to send reset email. Please try again later."],
        },
      }
    }

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return {
      errors: {
        _form: [
          "An error occurred while processing your request. Please try again.",
        ],
      },
    }
  }
}

/**
 * Reset password using a valid reset token
 * Validates token and updates password
 */
export async function resetPassword(
  _prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  try {
    // Validate form data
    const validatedFields = resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { token, password } = validatedFields.data

    // Hash the token to match stored format
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with matching token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    })

    if (!user) {
      return {
        errors: {
          _form: [
            "Invalid or expired reset token. Please request a new password reset.",
          ],
        },
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Password reset error:", error)
    return {
      errors: {
        _form: [
          "An error occurred while resetting your password. Please try again.",
        ],
      },
    }
  }
}

/**
 * Sign out the current user and invalidate the session
 */
export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" })
}
