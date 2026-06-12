import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin user ─────────────────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dachhomeandbody.com' },
    update: {},
    create: {
      email: 'admin@dachhomeandbody.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ── Categories ─────────────────────────────────────────────────────────

  const categories = [
    {
      name: 'Home Fragrance',
      slug: 'home-fragrance',
      description: 'Scented candles, reed diffusers, room sprays, fragrance oils and home scenting accessories',
    },
    {
      name: 'Body Oil',
      slug: 'body-oil',
      description: 'Nourishing and moisturising body oils for all skin types',
    },
    {
      name: 'Body Wash',
      slug: 'body-wash',
      description: 'Luxury body washes and liquid soaps including aromatherapy and black soap formulas',
    },
    {
      name: 'Massage Oil',
      slug: 'massage-oil',
      description: 'Therapeutic massage oils for relaxation and revitalization',
    },
    {
      name: 'Hand Wash & Lotion',
      slug: 'hand-wash-lotion',
      description: 'Gentle hand washes and moisturising hand lotions',
    },
    {
      name: 'Body Butter',
      slug: 'body-butter',
      description: 'Rich, deeply moisturising body butters in a variety of scents',
    },
    {
      name: 'Body Scrub',
      slug: 'body-scrub',
      description: 'Exfoliating sugar scrubs and skin treatments including Dead Sea mud mask',
    },
    {
      name: 'Gift Sets',
      slug: 'gift-sets',
      description: 'Curated gift boxes and sets — perfect for every occasion',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Bathrobes, beard oils and other lifestyle accessories',
    },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    })
  }
  console.log('✅ Created 9 categories')

  // ── Welcome coupon ─────────────────────────────────────────────────────

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 20000,
      maxUsageCount: 100,
      usageCount: 0,
      expiresAt: new Date('2027-12-31'),
      active: true,
    },
  })
  console.log('✅ Created coupon: WELCOME10 (10% off orders over ₦20,000)')

  console.log('🎉 Seeding complete!')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
