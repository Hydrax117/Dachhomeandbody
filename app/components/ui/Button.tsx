import Link from "next/link"
import type { ComponentPropsWithoutRef } from "react"

type Variant = "primary" | "secondary" | "ghost" | "icon"
type Size = "sm" | "md" | "lg"

const sizeMap: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[10px]",
  md: "",           // default — handled by CSS class
  lg: "px-10 py-5",
}

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: Variant
  size?: Size
  href?: string
  /** External link — renders <a> instead of Next Link */
  external?: boolean
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = `btn-${variant}`
  const sizeClass = sizeMap[size]
  const cls = [base, sizeClass, className].filter(Boolean).join(" ")

  if (href) {
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
