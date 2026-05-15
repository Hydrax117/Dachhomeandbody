"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// ── Schemas ────────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Nigeria"),
})

// ── Types ──────────────────────────────────────────────────────────────────

export type ProfileFormState = {
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    _form?: string[]
  }
  success?: boolean
}

export type PasswordFormState = {
  errors?: {
    currentPassword?: string[]
    newPassword?: string[]
    confirmPassword?: string[]
    _form?: string[]
  }
  success?: boolean
}

export type AddressFormState = {
  errors?: {
    name?: string[]
    phone?: string[]
    address?: string[]
    city?: string[]
    state?: string[]
    postalCode?: string[]
    country?: string[]
    _form?: string[]
  }
  success?: boolean
}

// ── Actions ────────────────────────────────────────────────────────────────

/**
 * Update user profile (name, email, phone)
 * Requirements: 13.1
 */
export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { errors: { _form: ["You must be logged in"] } }
  }

  const validated = updateProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, phone } = validated.data

  // Check if email is taken by another user
  if (email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== session.user.id) {
      return { errors: { email: ["This email is already in use"] } }
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email, phone: phone ?? null },
  })

  revalidatePath("/account/profile")
  return { success: true }
}

/**
 * Change user password
 * Requirements: 13.5
 */
export async function changePassword(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { errors: { _form: ["You must be logged in"] } }
  }

  const validated = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { currentPassword, newPassword } = validated.data

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })

  if (!user?.password) {
    return {
      errors: {
        _form: ["Password change is not available for accounts using social login"],
      },
    }
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return { errors: { currentPassword: ["Current password is incorrect"] } }
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { success: true }
}

/**
 * Add a new shipping address
 * Requirements: 13.2
 */
export async function addAddress(
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { errors: { _form: ["You must be logged in"] } }
  }

  const validated = addressSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "Nigeria",
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const isFirst = (await prisma.address.count({ where: { userId: session.user.id } })) === 0

  await prisma.address.create({
    data: {
      ...validated.data,
      userId: session.user.id,
      isDefault: isFirst, // first address becomes default
    },
  })

  revalidatePath("/account/profile")
  return { success: true }
}

/**
 * Update an existing address
 * Requirements: 13.2
 */
export async function updateAddress(
  id: string,
  _prevState: AddressFormState,
  formData: FormData
): Promise<AddressFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { errors: { _form: ["You must be logged in"] } }
  }

  const validated = addressSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "Nigeria",
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  // Ensure address belongs to this user
  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return { errors: { _form: ["Address not found"] } }
  }

  await prisma.address.update({
    where: { id },
    data: validated.data,
  })

  revalidatePath("/account/profile")
  return { success: true }
}

/**
 * Delete an address
 * Requirements: 13.4
 */
export async function deleteAddress(id: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const address = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!address) return { error: "Address not found" }

  await prisma.address.delete({ where: { id } })

  // If deleted address was default, promote the next one
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    })
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  revalidatePath("/account/profile")
  return {}
}

/**
 * Set an address as the default
 * Requirements: 13.3
 */
export async function setDefaultAddress(id: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const address = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!address) return { error: "Address not found" }

  // Unset all defaults for this user, then set the new one
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id },
      data: { isDefault: true },
    }),
  ])

  revalidatePath("/account/profile")
  return {}
}
