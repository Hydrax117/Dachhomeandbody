import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pooling is handled by the DATABASE_URL (e.g. via PgBouncer or Prisma Accelerate).
    // The datasource directUrl in schema.prisma is used for migrations.
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
