import type { ComponentPropsWithoutRef, LabelHTMLAttributes } from "react"

// ── Input ──────────────────────────────────────────────────
interface InputProps extends ComponentPropsWithoutRef<"input"> {
  error?: boolean
  dark?: boolean
}

export function Input({ error, dark, className = "", ...props }: InputProps) {
  const cls = [
    "input",
    dark ? "input-dark" : "",
    error ? "input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <input className={cls} {...props} />
}

// ── Label ──────────────────────────────────────────────────
interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  dark?: boolean
}

export function Label({ dark, className = "", children, ...props }: LabelProps) {
  return (
    <label
      className={[
        "label",
        dark ? "text-white/50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </label>
  )
}

// ── Field Error ────────────────────────────────────────────
export function FieldError({
  id,
  message,
  dark,
}: {
  id?: string
  message?: string
  dark?: boolean
}) {
  if (!message) return null
  return (
    <p
      id={id}
      className={["field-error", dark ? "text-red-400" : ""].filter(Boolean).join(" ")}
      role="alert"
    >
      {message}
    </p>
  )
}
