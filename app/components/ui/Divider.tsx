export function Divider({ className = "" }: { className?: string }) {
  return <hr className={["divider border-none", className].filter(Boolean).join(" ")} aria-hidden="true" />
}

export function GoldDivider({ className = "" }: { className?: string }) {
  return <div className={["divider-gold", className].filter(Boolean).join(" ")} aria-hidden="true" />
}
