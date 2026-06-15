import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Prisma Client Singleton
// ---------------------------------------------------------------------------
// In development, Next.js hot-reloads modules which can create multiple
// PrismaClient instances. We store the client on `globalThis` to reuse it.
// In production, a single instance is created normally.
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
