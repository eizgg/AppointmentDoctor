import 'dotenv/config'
import { createRequire } from 'node:module'
import { PrismaPg } from '@prisma/adapter-pg'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient()
  }
  prisma = globalThis.__prisma
}

export default prisma
