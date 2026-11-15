const chatRepository = require("./chat.repository");

class ChatService {
    async createOrGetPrivateChat(
        userAId: string,
        userBId: string
    ) {
        if (userAId === userBId) {
            throw new Error("SELF_CHAT_NOT_ALLOWED");
        }

        const sortedIds = [userAId, userBId].sort();
        const pairKey = sortedIds.join(":");

        const existingChat = await chatRepository.findPrivateChatByPairKey(pairKey);

        if (existingChat) {
            return {
                chat: existingChat,
                isNew: false
            };
        }

        const users = await chatRepository.findUserByIds([
            userAId,
            userBId
        ]);

        if (users.length !== 2) {
            throw new Error("USER_NOT_FOUND");
        }


        try {
            const chat = await chatRepository.createPrivateChat(
                userAId,
                userBId,
                pairKey
            );
            return {
                chat,
                isNew: true
            };
        } catch (error: any) {
            if (error.code === "P2002") {
                const chat = await chatRepository.findPrivateChatByPairKey(pairKey);
                if (chat) {
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

        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }

        const chats = await chatRepository.findChatByUserId(userId);

        return chats.map((chat: any) => ({
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

        if (!chat) {
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

    async createGroupChat(
        name: string,
        creatorId: string,
        memberIds: string[]
    ) {
        // 1. Validate group name
        if (!name || !name.trim()) {
            throw new Error("INVALID_GROUP_NAME");
        }

        // 2. Remove duplicate member IDs
        const uniqueMemberIds = [...new Set(memberIds)];

        // 3. Ensure creator is included
        if (!uniqueMemberIds.includes(creatorId)) {
            uniqueMemberIds.push(creatorId);
        }

        // 4. Validate minimum group size
        if (uniqueMemberIds.length < 3) {
            throw new Error("MINIMUM_GROUP_MEMBERS_REQUIRED");
        }

        // 5. Verify that all users exist
        const users = await chatRepository.findUserByIds(
            uniqueMemberIds
        );

        if (users.length !== uniqueMemberIds.length) {
            throw new Error("USER_NOT_FOUND");
        }

        // 6. Create group chat
        return await chatRepository.createGroupChat(
            name.trim(),
            creatorId,
            uniqueMemberIds
        );
    }

    async addGroupMembers(
        chatId: string,
        requesterId: string,
        memberIds: string[]
    ) {
        // 1. Check whether chat exists
        const chat = await chatRepository.findChatWithMembers(chatId);

        if (!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        // 2. Ensure it is a group chat
        if (chat.type !== "GROUP") {
            throw new Error("NOT_A_GROUP_CHAT");
        }

        // 3. Verify requester is a group member
        const requester = chat.members.find(
            (member: any) => member.userId === requesterId
        );

        if (!requester) {
            throw new Error("USER_NOT_CHAT_MEMBER");
        }

        // 4. Verify requester is an admin
        if (requester.role !== "ADMIN") {
            throw new Error("ADMIN_PERMISSION_REQUIRED");
        }

        // 5. Remove duplicate IDs from request
        const uniqueMemberIds = [...new Set(memberIds)];

        // 6. Find existing group members
        const existingMemberIds = chat.members.map(
            (member: any) => member.userId
        );

        const newMemberIds = uniqueMemberIds.filter(
            (id) => !existingMemberIds.includes(id)
        );

        if (newMemberIds.length === 0) {
            throw new Error("NO_NEW_MEMBERS");
        }

        // 7. Verify all new users exist
        const users = await chatRepository.findUserByIds(newMemberIds);

        if (users.length !== newMemberIds.length) {
            throw new Error("USER_NOT_FOUND");
        }

        // 8. Add new members
        return await chatRepository.addGroupMembers(
            chatId,
            newMemberIds
        );
    }

    async removeGroupMember(
        chatId: string,
        requesterId: string,
        userId: string
    ) {
        // 1. Verify group exists
        const chat = await chatRepository.findGroupWithMembers(chatId);

        if (!chat) {
            throw new Error("CHAT_NOT_FOUND");
        }

        // 2. Ensure group chat
        if (chat.type !== "GROUP") {
            throw new Error("NOT_A_GROUP_CHAT");
        }

        // 3. Verify requester is an admin
        const requester = chat.members.find(
            (member: any) => member.userId === requesterId
        );

        if (!requester) {
            throw new Error("USER_NOT_CHAT_MEMBER");
        }

        if (requester.role !== "ADMIN") {
            throw new Error("ADMIN_PERMISSION_REQUIRED");
        }

        // 4. Prevent admin from removing themselves
        if (requesterId === userId) {
            throw new Error("CANNOT_REMOVE_SELF");
        }

        // 5. Verify target member exists in group
        const targetMember = chat.members.find(
            (member: any) => member.userId === userId
        );

        if (!targetMember) {
            throw new Error("USER_NOT_CHAT_MEMBER");
        }

        // 6. Protect the last admin
        const adminCount = chat.members.filter(
            (member: any) => member.role === "ADMIN"
        ).length;

        if (targetMember.role === "ADMIN" && adminCount === 1) {
            throw new Error("CANNOT_REMOVE_LAST_ADMIN");
        }

        // 7. Remove member
        await chatRepository.removeGroupMember(chatId, userId);

        return {
            chatId,
            removedUserId: userId,
            message: "Member removed successfully",
        };
    }
}

module.exports = new ChatService();