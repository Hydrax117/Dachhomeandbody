import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign In Error | DACH Home & Body",
}

const errorMessages: Record<string, { heading: string; body: string }> = {
  Configuration: {
    heading: "Server configuration error",
    body: "There is a problem with the sign-in configuration. Please try again later or sign in with your email and password.",
  },
  AccessDenied: {
    heading: "Access denied",
    body: "You do not have permission to sign in. Please contact support if you believe this is a mistake.",
  },
  Verification: {
    heading: "Link expired",
    body: "The sign-in link has expired or has already been used. Please request a new one.",
  },
  OAuthSignin: {
    heading: "Could not start sign in",
    body: "There was a problem starting the sign-in process. Please try again.",
  },
  OAuthCallback: {
    heading: "Sign in callback error",
    body: "There was a problem completing your sign in. Please try again.",
  },
  OAuthCreateAccount: {
    heading: "Could not create account",
    body: "We were unable to create your account. Please try signing in with email and password instead.",
  },
  EmailCreateAccount: {
    heading: "Could not create account",
    body: "We were unable to create your account. Please try again.",
  },
  Callback: {
    heading: "Sign in error",
    body: "There was a problem during sign in. Please try again.",
  },
  Default: {
    heading: "Something went wrong",
    body: "An error occurred during sign in. Please try again or use a different sign-in method.",
  },
}

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams
  const errorKey = error && errorMessages[error] ? error : "Default"
  const { heading, body } = errorMessages[errorKey]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2] px-6 py-20">
      <div className="w-full max-w-md text-center">

        {/* Brand */}
        <Link
          href="/"
          className="inline-block font-serif text-sm tracking-[0.22em] uppercase text-[#111111] hover:text-[#B8965C] transition-colors mb-10"
        >
          DACH Home &amp; Body
        </Link>

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Error detail */}
        <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-3">
          Sign In Error
        </p>
        <h1 className="font-serif text-[#111111] text-2xl font-medium mb-4">
          {heading}
        </h1>
        <p className="text-sm text-[#8C8C8C] leading-[1.9] mb-8 max-w-sm mx-auto">
          {body}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
          >
            Back to Sign In
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-[#e5e5e5] text-[#8C8C8C] text-[10px] tracking-[0.25em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300"
          >
            Contact Support
          </Link>
        </div>

        {/* Error code for debugging */}
        {error && (
          <p className="mt-8 text-[11px] text-[#C4C4C4] font-mono">
            Error code: {error}
          </p>
        )}
      </div>
    </div>
  )
}
