const firestore = require("../../config/firebase");
const admin = require("firebase-admin");

const prisma = require("../../config/database");

class MessageRepository {
    async findChatById(chatId: string) {
        return await prisma.chat.findUnique({
            where: { id: chatId },
            select: { id: true }
        });
    }

    async findChatMember(chatId: string, userId: string) {
        return await prisma.chatMember.findUnique({
            where: {
                chatId_userId: {
                    chatId,
                    userId
                }
            }
        });
    }

    async createMessage(chatId: string, senderId: string, text: string) {
        const messageRef = firestore.collection("chats")
                                    .doc(chatId)
                                    .collection("messages")
                                    .doc();
        
        await messageRef.set({
            senderId,
            text,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            editedAt: null,
            deletedAt: null
        });

        const savedMessage = await messageRef.get();

        const messageData = savedMessage.data();

        return {
            messageId: messageRef.id,
            senderId: messageData.senderId,
            text: messageData.text,
            createdAt: messageData.createdAt.toDate()
        };
    }
}

module.exports = new MessageRepository();