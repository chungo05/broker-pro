import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  // Default to allowing self-signed / custom CAs in managed DBs.
  // Set PGSSL_REJECT_UNAUTHORIZED=true to enforce CA validation.
  const raw = process.env.PGSSL_REJECT_UNAUTHORIZED?.trim().toLowerCase()
  const sslRejectUnauthorized = raw === 'true' || raw === '1' || raw === 'yes'

  const url = new URL(connectionString)
  const sslMode = url.searchParams.get('sslmode')?.toLowerCase()
  const ssl =
    sslMode === 'disable'
      ? false
      : {
          rejectUnauthorized: sslRejectUnauthorized,
          ca: process.env.PGSSL_CA,
        }

  const pool = new Pool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    ssl,
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter, log: ['error'] })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma