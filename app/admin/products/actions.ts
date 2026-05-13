"use server"

import { auth } from "@/lib/auth"
import { deleteProduct } from "@/lib/products"
import { revalidatePath } from "next/cache"

export async function deleteProductAction(productId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  try {
    await deleteProduct(productId)
    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return {}
  } catch {
    return { error: "Failed to delete product. Please try again." }
  }
}
