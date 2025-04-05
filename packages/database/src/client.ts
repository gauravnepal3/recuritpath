import { PrismaClient as GeneratedPrismaClient } from "../generated/client";

// Break complex type aliasing
type DB = GeneratedPrismaClient;

const globalForPrisma = global as unknown as { prisma: DB };

export const prisma = globalForPrisma.prisma || new GeneratedPrismaClient({
    log: ['query', 'info', 'warn', 'error'],
}

);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
