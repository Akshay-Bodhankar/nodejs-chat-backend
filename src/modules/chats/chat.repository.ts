const prisma = require("../../config/database");

class ChatRepository {
    async findUserByIds(userIds: string[]) {
        return await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
    }

    async findPrivateChatByPairKey(pairKey: string) {
        return await prisma.chat.findUnique({
            where: {
                privatePairKey: pairKey
            },
            include: {
                members: {
                    select: {
                        userId: true,
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }

    async createPrivateChat(
        userAId: string,
        userBId: string,
        pairKey: string
    ) {
        return await prisma.chat.create({
            data: {
                type: "PRIVATE",
                privatePairKey: pairKey,
                members: {
                    create: [
                        {
                            userId: userAId,
                            role: "MEMBER"
                        },
                        {
                            userId: userBId,
                            role: "MEMBER"
                        }
                    ]
                }
            },
            include: {
                members: {
                    select: {
                        userId: true,
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findUserById(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
    }

    async findChatByUserId(userId: string) {
        return await prisma.chat.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    async findChatById(chatId: string) {
        return await prisma.chat.findUnique({
            where: {
                id: chatId
            },
            include: {
                members: {
                    select: {
                        role: true,
                        joinedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })
    }

    //bonus Task
    async createGroupChat(
        name: string,
        creatorId: string,
        memberIds: string[]
    ) {
        return await prisma.chat.create({
            data: {
                type: "GROUP",
                name,
                members: {
                    create: memberIds.map((userId) => ({
                        userId,
                        role: userId === creatorId ? "ADMIN" : "MEMBER",
                    })),
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    //bonus Task
    async findChatWithMembers(chatId: string) {
        return await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                members: true,
            },
        });
    }

    //bonus Task
    async addGroupMembers(
        chatId: string,
        memberIds: string[]
    ) {
        await prisma.chatMember.createMany({
            data: memberIds.map((userId) => ({
                chatId,
                userId,
                role: "MEMBER",
            })),
            skipDuplicates: true,
        });

        return await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async removeGroupMember(chatId: string, userId: string) {
        return await prisma.chatMember.delete({
            where: {
                chatId_userId: {
                    chatId,
                    userId,
                },
            },
        });
    }

    async findGroupWithMembers(chatId: string) {
        return await prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
}

module.exports = new ChatRepository();