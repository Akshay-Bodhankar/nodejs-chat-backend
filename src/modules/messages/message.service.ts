const messageRepository = require("./message.repository");

class MessageService {
    async sendMessage(chatId: string, senderId: string, text: string) {
        const chat = await messageRepository.findChatById(chatId);

        if(!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        const member = await messageRepository.findChatMember(chatId, senderId);

        if(!member) {
            throw new Error("NOT_CHAT_MEMBER");
        }

        const message = await messageRepository.createMessage(chatId, senderId, text.trim());

        return message;
    }

    async getMessages(chatId: string, limit: number) {
        const chat = await messageRepository.findChatById(chatId);

        if(!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        return await messageRepository.getMessages(chatId, limit);
    }

    async markMessageAsRead(
        chatId: string,
        messageId: string,
        userId: string
    ) {
        const chat = await messageRepository.findChatById(chatId);

        if(!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        const member = await messageRepository.findChatMember(chatId, userId);

        if(!member) {
            throw new Error("USER_NOT_CHAT_MEMBER");
        }

        return await messageRepository.markMessageAsRead(chatId, messageId, userId);
    }

    async updateLastSeen(chatId: string, userId: string, messageId: string){
        const chat = await messageRepository.findChatById(chatId);

        if(!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        const member = await messageRepository.findChatMember(chatId, userId);

        if(!member) {
            throw new Error("USER_NOT_CHAT_MEMBER");
        }

        const message = await messageRepository.findMessage(chatId, messageId);

        if(!message) {
            throw new Error("MESSAGE_NOT_FOUND");
        }

        return await messageRepository.updateLastSeen(chatId, userId, messageId);
    }
}

module.exports = new MessageService();