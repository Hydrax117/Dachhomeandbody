"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Suspense, useEffect } from "react"
import { login } from "@/app/actions/auth"
import type { LoginFormState } from "@/app/actions/auth"

function EyeOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeClosedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-4 px-6 bg-[#111111] text-[#F8F5F2] font-[family-name:var(--font-manrope)] text-xs tracking-[0.2em] uppercase rounded-sm transition-all duration-300 hover:bg-[#B8965C] hover:text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#B8965C] focus:ring-offset-2 focus:ring-offset-[#F8F5F2]"
    >
      {pending ? "Signing in\u2026" : "Sign In"}
    </button>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const initialState: LoginFormState = {}
  const [state, formAction] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (state.success) {
      // Admins always go to their dashboard; customers go to callbackUrl
      const destination = state.isAdmin ? "/admin" : callbackUrl
      router.push(destination)
      router.refresh()
    }
  }, [state.success, state.isAdmin, callbackUrl, router])

  return (
    <div className="min-h-screen flex font-[family-name:var(--font-manrope)]">

      {/* LEFT — cinematic image panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/homepage-bg.png"
          alt="Luxury perfume bottle on stone surface with warm amber lighting"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        {/* dark moody overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
        {/* warm amber vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3D1F00]/60 via-transparent to-transparent" />
        {/* editorial text */}
        <div className="absolute inset-0 flex flex-col justify-end p-14">
          <p className="font-[family-name:var(--font-playfair)] text-[#F8F5F2]/90 text-3xl leading-snug italic font-light mb-6 max-w-xs">
            &ldquo;Crafted scents for unforgettable presence.&rdquo;
          </p>
          <div className="w-10 h-px bg-[#B8965C]" />
        </div>
      </div>

      {/* RIGHT — login form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F8F5F2] px-8 sm:px-12 lg:px-16 py-16 relative">

        {/* Mobile full-screen background */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/homepage-bg.png" alt="" fill priority className="object-cover object-center" sizes="(min-width: 1024px) 0px, 100vw" />
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
        </div>

        {/* Card — glassmorphism on mobile, plain on desktop */}
        <div className="relative z-10 w-full max-w-sm lg:bg-transparent lg:shadow-none lg:border-none lg:p-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 lg:rounded-none shadow-2xl lg:shadow-none">

          {/* Brand name */}
          <div className="mb-10 text-center lg:text-left">
            <span className="font-[family-name:var(--font-playfair)] text-sm tracking-[0.35em] uppercase text-white lg:text-[#111111]">
              Dachhomeandbody
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-white lg:text-[#111111] mb-2">
              Welcome Back
            </h1>
            <p className="text-xs tracking-wide text-white/70 lg:text-[#111111]/50">
              Sign in to continue your fragrance journey.
            </p>
          </div>

          {/* Form-level error */}
          {state.errors?._form && (
            <div role="alert" className="mb-6 border border-red-300/50 bg-red-50/80 text-red-800 px-4 py-3 rounded-sm text-xs">
              {state.errors._form[0]}
            </div>
          )}

          <form action={formAction} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] tracking-[0.18em] uppercase text-white/60 lg:text-[#111111]/50 mb-2">
                Email Address
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                aria-describedby={state.errors?.email ? "email-error" : undefined}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-white/10 lg:bg-transparent border border-white/30 lg:border-[#111111]/20 text-white lg:text-[#111111] placeholder-white/30 lg:placeholder-[#111111]/30 text-sm rounded-sm focus:outline-none focus:border-[#B8965C] focus:ring-1 focus:ring-[#B8965C] transition-colors duration-200"
              />
              {state.errors?.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-400 lg:text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[10px] tracking-[0.18em] uppercase text-white/60 lg:text-[#111111]/50">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-[10px] tracking-wide text-[#B8965C] hover:text-[#B8965C]/70 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"}
                  autoComplete="current-password" required
                  aria-describedby={state.errors?.password ? "password-error" : undefined}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 pr-11 bg-white/10 lg:bg-transparent border border-white/30 lg:border-[#111111]/20 text-white lg:text-[#111111] placeholder-white/30 lg:placeholder-[#111111]/30 text-sm rounded-sm focus:outline-none focus:border-[#B8965C] focus:ring-1 focus:ring-[#B8965C] transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 lg:text-[#111111]/40 hover:text-[#B8965C] transition-colors"
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              {state.errors?.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-400 lg:text-red-600">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Sign In */}
            <div className="pt-2">
              <SubmitButton />
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-white/20 lg:bg-[#111111]/10" />
              <span className="text-[10px] tracking-widest uppercase text-white/40 lg:text-[#111111]/30">or</span>
              <div className="flex-1 h-px bg-white/20 lg:bg-[#111111]/10" />
            </div>

            {/* Google */}
            <a
              href="/api/auth/signin/google"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-white/30 lg:border-[#111111]/20 text-white lg:text-[#111111] text-xs tracking-[0.12em] uppercase rounded-sm hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-200"
            >
              <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </a>

            {/* Register link */}
            <p className="text-center text-[11px] tracking-wide text-white/50 lg:text-[#111111]/40 pt-1">
              New to Dachhomeandbody?{" "}
              <Link href="/auth/register" className="text-[#B8965C] hover:text-[#B8965C]/70 transition-colors">
                Create an account
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F2]">
        <span className="font-[family-name:var(--font-playfair)] text-sm tracking-widest uppercase text-[#111111]/40">
          Loading\u2026
        </span>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
