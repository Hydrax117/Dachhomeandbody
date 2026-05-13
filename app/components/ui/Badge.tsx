import type { ComponentPropsWithoutRef } from "react"

type BadgeVariant = "gold" | "dark" | "cream"

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant
}

export function Badge({ variant = "gold", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={["badge", `badge-${variant}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  )
}
