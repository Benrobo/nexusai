import { PrismaClient } from "@prisma/client";

// prevent multiple instances of PrismaClient in development

declare global {
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
