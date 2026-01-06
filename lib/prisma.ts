// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv'

declare global {
  var prisma: PrismaClient | undefined;
}

dotenv.config()
const connectionString = `${process.env.DATABASE_URL}`

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString}),
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;