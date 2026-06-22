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

  // ── Gift Boxes ─────────────────────────────────────────────────────────

  const giftBoxes = [
    {
      title: 'Signature Cream Box',
      slug: 'signature-cream-box',
      description: 'Our classic cream textured gift box with black satin ribbon and gold embossed logo. Perfect for any occasion, this timeless choice speaks of understated elegance.',
      image: '/images/gift-boxes/signature-cream.jpg',
      maxItems: 3,
      price: 5000,
      theme: 'SIGNATURE_CREAM' as const,
      active: true,
      sortOrder: 1,
    },
    {
      title: 'Noir Luxury Box',
      slug: 'noir-luxury-box',
      description: 'A statement in sophistication. Matte black rigid box with velvet interior, gold foil branding, and a premium weight that signals intention before it is even opened.',
      image: '/images/gift-boxes/noir-luxury.jpg',
      maxItems: 5,
      price: 8500,
      theme: 'NOIR_LUXURY' as const,
      active: true,
      sortOrder: 2,
    },
    {
      title: 'Romantic Blush Box',
      slug: 'romantic-blush-box',
      description: 'Delicate nude blush tones with silk ribbon and a handwritten-style floral insert card. Ideal for anniversaries, Valentine\'s Day, or simply saying "I love you".',
      image: '/images/gift-boxes/romantic-blush.jpg',
      maxItems: 4,
      price: 6500,
      theme: 'ROMANTIC_BLUSH' as const,
      active: true,
      sortOrder: 3,
    },
  ]

  for (const box of giftBoxes) {
    await prisma.giftBox.upsert({
      where: { slug: box.slug },
      update: {
        title: box.title,
        description: box.description,
        maxItems: box.maxItems,
        price: box.price,
        theme: box.theme,
        active: box.active,
        sortOrder: box.sortOrder,
      },
      create: box,
    })
  }
  console.log('✅ Created 3 gift boxes')

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
