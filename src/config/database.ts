
const { PrismaClient } = require("../generated/prisma/client") as typeof import("../generated/prisma/client");

const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
    connectionString
});

const prisma = new PrismaClient({
    adapter
});

module.exports = prisma;
