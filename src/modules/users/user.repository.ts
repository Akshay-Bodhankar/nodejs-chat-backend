const prisma = require("../../config/database") as import("../../generated/prisma/client").PrismaClient;

class UserRepository {

    async createUser(data: {name: string; email: string}){
        return await prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
    }

    async findUserById(userId: string) {
        return await prisma.user.findUnique({
            where: {id: userId},
            select:{
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
    }
    
    async findUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: {email}
        });
    }
}

module.exports = new UserRepository();