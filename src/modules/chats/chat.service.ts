const chatRepository = require("./chat.repository");

class ChatService {
    async createOrGetPrivateChat(
        userAId: string,
        userBId: string
    ) {
        if(userAId === userBId) {
            throw new Error("SELF_CHAT_NOT_ALLOWED");
        }

        const sortedIds = [userAId, userBId].sort();
        const pairKey = sortedIds.join(":");

        const existingChat = await chatRepository.findPrivateChatByPairKey(pairKey);

        if(existingChat) {
            return {
                chat: existingChat,
                isNew: false
            };
        }

        const users = await chatRepository.findUserByIds([
            userAId,
            userBId
        ]);

        if(users.length !== 2) {
            throw new Error("USER_NOT_FOUND");
        }


        try {
            const chat = await chatRepository.createPrivateChat(
                userAId,
                userBId,
                pairKey
            );
            return{
                chat,
                isNew: true
            };
        }catch (error: any) {
            if(error.code === "P2002")
            {
                const chat = await chatRepository.findPrivateChatByPairKey(pairKey);
                if(chat) {
                    return {
                        chat,
                        isNew: false
                    };
                }
            }
            throw error;        
        }
    }

    async getUserChat(userId: string) {
        const user = await chatRepository.findChatByUserId(userId);
        
        if(!user) {
            throw new Error("USER_NOT_FOUND");
        }

        const chats = await chatRepository.findChatByUserId(userId);

        return chats.map((chat:any) => ({
            chatId: chat.id,
            type: chat.type,
            name: chat.name,
            createdAt: chat.createdAt,
            members: chat.members.map((member: any) => ({
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
                role: member.role
            }))
        }));
    }

    async getChatById(chatId: string) {
        const chat = await chatRepository.findChatById(chatId);

        if(!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        return {
            chatId: chat.id,
            type: chat.type,
            name: chat.name,
            createdAt: chat.createdAt,
            members: chat.members.map((member: any) => ({
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
                role: member.role,
                joinedAt: member.joinedAt
            }))
        };
    }
}

module.exports = new ChatService();