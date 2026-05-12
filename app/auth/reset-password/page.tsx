"use client"

import { useFormState } from "react-dom"
import { useFormStatus } from "react-dom"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { resetPassword } from "@/app/actions/auth"
import type { ResetPasswordFormState } from "@/app/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-3 px-4 rounded-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 uppercase tracking-wider text-sm font-medium"
    >
      {pending ? "Resetting..." : "Reset Password"}
    </button>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const initialState: ResetPasswordFormState = {}
  const [state, formAction] = useFormState(resetPassword, initialState)

  // Redirect to login on success
  if (state.success) {
    setTimeout(() => {
      router.push("/auth/login")
    }, 2000)
  }

  // If no token in URL, show error
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
              Dachhomeandbody
            </h1>
            <h2 className="text-xl font-light text-gray-900 mb-4">
              Invalid Reset Link
            </h2>
          </div>

          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-sm">
            <p className="text-sm">
              This password reset link is invalid. Please request a new one.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="inline-block bg-black text-white py-3 px-8 rounded-sm hover:bg-gray-800 transition-colors duration-200 uppercase tracking-wider text-sm font-medium"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Dachhomeandbody
          </h1>
          <h2 className="text-xl font-light text-gray-900 mb-2">
            Create New Password
          </h2>
          <p className="text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {/* Success Message */}
        {state.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-sm">
            <p className="text-sm">
              Password reset successful! Redirecting to login...
            </p>
          </div>
        )}

        {/* Error Message */}
        {state.errors?._form && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-sm">
            <p className="text-sm">{state.errors._form[0]}</p>
          </div>
        )}

        {/* Form */}
        {!state.success && (
          <form action={formAction} className="mt-8 space-y-6">
            {/* Hidden token field */}
            <input type="hidden" name="token" value={token} />

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:z-10 sm:text-sm"
                placeholder="Enter new password"
              />
              {state.errors?.password && (
                <p className="mt-2 text-sm text-red-600">
                  {state.errors.password[0]}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Password must be at least 8 characters and contain both letters
                and numbers.
              </p>
            </div>

            <div>
              <SubmitButton />
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
