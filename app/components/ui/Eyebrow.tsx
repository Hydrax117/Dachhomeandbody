import type { ComponentPropsWithoutRef } from "react"

interface EyebrowProps extends ComponentPropsWithoutRef<"p"> {
  dark?: boolean
}

export function Eyebrow({ dark, className = "", children, ...props }: EyebrowProps) {
  return (
    <p
      className={[
        "text-eyebrow",
        dark ? "text-[#B8965C]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </p>
  )
}
