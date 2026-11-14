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
}

module.exports = new MessageService();