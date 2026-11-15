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

    async getMessages(chatId: string, limit: number) {
        const snapshot = await firestore.collection("chats")
            .doc(chatId)
            .collection("messages")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();
        return snapshot.docs.map((doc: any) => {
            const data = doc.data();

            return {
                messageId: doc.id,
                senderId: data.senderId,
                text: data.text,
                createdAt: data.createdAt?.toDate() ?? null,
                editedAt: data.editedAt?.toDate() ?? null,
                deletedAt: data.deletedAt?.toDate() ?? null,
            };
        }).reverse();
    }

    async markMessageAsRead(chatId: string, messageId: string, userId: string) {
        const messageRef = firestore.collection("chats")
            .doc(chatId)
            .collection("messages")
            .doc(messageId);

        const messageSnapshot = await messageRef.get();

        if (!messageSnapshot.exists) {
            throw new Error("MESSAGE_NOT_FOUND");
        }

        await messageRef.collection("readReceipts")
            .doc(userId)
            .set({
                userId,
                readAt: admin.firestore.FieldValue.serverTimestamp(),
            });

        return {
            messageId,
            userId,
            status: "READ",
        };
    }

    async updateLastSeen(chatId: string, userId: string, messageId: string) {
        return await prisma.chatMember.update({
            where: {
                chatId_userId: {
                    chatId,
                    userId
                }
            },
            data: {
                lastSeenMessageId: messageId,
                lastSeenAt: new Date(),
            },
            select: {
                chatId: true,
                userId: true,
                lastSeenMessageId: true,
                lastSeenAt: true
            }
        })
    }

    async findMessage(chatId: string, messageId: string) {
        const messageRef = firestore.collection("chats")
            .doc(chatId)
            .collection("messages")
            .doc(messageId)
        const snapshot = await messageRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return {
            messageId: snapshot.id,
            ...snapshot.data()
        }
    }

    async editMessage(
        chatId: string,
        messageId: string,
        text: string
    ) {
        const messageRef = firestore
            .collection("chats")
            .doc(chatId)
            .collection("messages")
            .doc(messageId);

        await messageRef.update({
            text,
            editedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const snapshot = await messageRef.get();
        const data = snapshot.data();

        return {
            messageId: snapshot.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: data.createdAt?.toDate() ?? null,
            editedAt: data.editedAt?.toDate() ?? null,
        };
    }

    async deleteMessage(
        chatId: string,
        messageId: string
    ) {
        const messageRef = firestore
            .collection("chats")
            .doc(chatId)
            .collection("messages")
            .doc(messageId);

        await messageRef.update({
            text: "This message was deleted",
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const snapshot = await messageRef.get();
        const data = snapshot.data();

        return {
            messageId: snapshot.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: data.createdAt?.toDate() ?? null,
            deletedAt: data.deletedAt?.toDate() ?? null,
        };
    }
}

module.exports = new MessageRepository();