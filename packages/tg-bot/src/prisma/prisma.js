import { PrismaClient } from "@prisma/client";

// prevent multiple instances of PrismaClient in development

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
