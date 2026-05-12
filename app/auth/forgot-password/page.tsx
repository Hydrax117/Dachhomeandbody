"use client"

import { useFormState } from "react-dom"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { requestPasswordReset } from "@/app/actions/auth"
import type { RequestPasswordResetFormState } from "@/app/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-3 px-4 rounded-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 uppercase tracking-wider text-sm font-medium"
    >
      {pending ? "Sending..." : "Send Reset Link"}
    </button>
  )
}

export default function ForgotPasswordPage() {
  const initialState: RequestPasswordResetFormState = {}
  const [state, formAction] = useFormState(requestPasswordReset, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
            Dachhomeandbody
          </h1>
          <h2 className="text-xl font-light text-gray-900 mb-2">
            Reset Your Password
          </h2>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {/* Success Message */}
        {state.success && state.message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-sm">
            <p className="text-sm">{state.message}</p>
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
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:z-10 sm:text-sm"
                placeholder="you@example.com"
              />
              {state.errors?.email && (
                <p className="mt-2 text-sm text-red-600">
                  {state.errors.email[0]}
                </p>
              )}
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

        {/* Success State - Show link back to login */}
        {state.success && (
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-block bg-black text-white py-3 px-8 rounded-sm hover:bg-gray-800 transition-colors duration-200 uppercase tracking-wider text-sm font-medium"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
