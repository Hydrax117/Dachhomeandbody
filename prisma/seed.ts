import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
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
  console.log('✅ Created admin user:', admin.email)

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Test Customer',
      password: customerPassword,
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created test customer:', customer.email)

  // Create categories
  const categories = [
    {
      name: 'Perfumes',
      slug: 'perfumes',
      description: 'Luxury perfumes and eau de parfums',
    },
    {
      name: 'Body Care',
      slug: 'body-care',
      description: 'Premium body lotions, oils, and care products',
    },
    {
      name: 'Colognes',
      slug: 'colognes',
      description: 'Fresh and sophisticated colognes',
    },
    {
      name: 'Gift Sets',
      slug: 'gift-sets',
      description: 'Curated fragrance gift collections',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }
  console.log('✅ Created categories')

  // Create sample products
  const perfumeCategory = await prisma.category.findUnique({
    where: { slug: 'perfumes' },
  })

  if (perfumeCategory) {
    const products = [
      {
        name: 'Midnight Oud',
        slug: 'midnight-oud',
        description:
          'A sophisticated blend of oud wood, amber, and vanilla. Deep, mysterious, and unforgettable.',
        price: 45000,
        compareAtPrice: 55000,
        images: [
          'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
        ],
        categoryId: perfumeCategory.id,
        stock: 50,
        sku: 'PERF-MO-001',
        featured: true,
        fragranceType: 'EAU_DE_PARFUM',
        topNotes: ['Bergamot', 'Saffron', 'Pink Pepper'],
        heartNotes: ['Oud Wood', 'Rose', 'Jasmine'],
        baseNotes: ['Amber', 'Vanilla', 'Musk'],
        longevity: 'VERY_LONG',
        strength: 'STRONG',
        moodTags: ['Mysterious', 'Sophisticated', 'Evening'],
        gender: 'UNISEX',
      },
      {
        name: 'Citrus Dawn',
        slug: 'citrus-dawn',
        description:
          'A fresh and invigorating blend of citrus notes. Perfect for daytime wear.',
        price: 35000,
        images: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
        ],
        categoryId: perfumeCategory.id,
        stock: 75,
        sku: 'PERF-CD-002',
        featured: true,
        fragranceType: 'EAU_DE_TOILETTE',
        topNotes: ['Lemon', 'Orange', 'Grapefruit'],
        heartNotes: ['Neroli', 'Lavender', 'Green Tea'],
        baseNotes: ['Cedarwood', 'White Musk'],
        longevity: 'MODERATE',
        strength: 'LIGHT',
        moodTags: ['Fresh', 'Energizing', 'Daytime'],
        gender: 'UNISEX',
      },
      {
        name: 'Velvet Rose',
        slug: 'velvet-rose',
        description:
          'An elegant rose fragrance with powdery undertones. Timeless and romantic.',
        price: 42000,
        images: [
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800',
        ],
        categoryId: perfumeCategory.id,
        stock: 60,
        sku: 'PERF-VR-003',
        featured: false,
        fragranceType: 'EAU_DE_PARFUM',
        topNotes: ['Peony', 'Blackcurrant'],
        heartNotes: ['Rose', 'Violet', 'Iris'],
        baseNotes: ['Sandalwood', 'Vanilla', 'Musk'],
        longevity: 'LONG',
        strength: 'MODERATE',
        moodTags: ['Romantic', 'Elegant', 'Feminine'],
        gender: 'FEMALE',
      },
    ]

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      })
    }
    console.log('✅ Created sample products')
  }

  // Create a sample coupon
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
      expiresAt: new Date('2026-12-31'),
      active: true,
    },
  })
  console.log('✅ Created sample coupon: WELCOME10')

  console.log('🎉 Seeding completed!')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
