/**
 * Server component — fetches categories from the DB and passes them
 * to the client Navbar so the mega menu reflects real data.
 */
import { getCategories } from "@/lib/categories"
import { withDbFallback } from "@/lib/db-resilience"
import Navbar from "./Navbar"

interface NavbarWrapperProps {
  transparentHero?: boolean
}

export default async function NavbarWrapper({ transparentHero = false }: NavbarWrapperProps) {
  const { data: categories } = await withDbFallback(() => getCategories(), [])
  return <Navbar transparentHero={transparentHero} categories={categories} />
}
