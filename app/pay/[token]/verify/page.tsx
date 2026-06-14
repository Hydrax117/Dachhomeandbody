/**
 * /pay/[token]/verify — legacy redirect
 * The callback now goes directly to /checkout/verify.
 * This page is only hit by old links or manual navigation.
 */
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: Promise<{ reference?: string; trxref?: string }>
}

export default async function PayVerifyRedirect({ searchParams }: PageProps) {
  const { reference, trxref } = await searchParams
  const ref = reference ?? trxref
  if (ref) redirect(`/checkout/verify?reference=${encodeURIComponent(ref)}`)
  redirect("/")
}
