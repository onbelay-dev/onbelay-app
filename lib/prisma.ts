// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global PrismaClient in dev to prevent multiple instances
  // This avoids creating multiple connections during hot reloads
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // optional: logs SQL queries in console
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
