require("dotenv").config();

const app = require("./app");

const prisma = require("./config/database") as import ("./generated/prisma/client").PrismaClient;
const firestore = require("./config/firebase");

const PORT = process.env.PORT || 8000;

async function startServer() {
    try {
        await prisma.$connect();
        await prisma.$queryRawUnsafe("SELECT 1");

        console.log("PostgresSQL connected sucessfully!");
        console.log("Firebase Firestore initialized successfully");

        app.listen(PORT, () => {
            console.log(`Chat Backend running on port ${PORT}`);
        });

    } catch (error)
    {
        console.error("Database connection failed: ", error);
        process.exit(1);
    }
}

startServer();