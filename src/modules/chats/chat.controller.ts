const chatService = require("./chat.service");
const { z } = require("zod");

const createChatSchema = z.object({
    userAId: z.string().uuid(),
    userBId: z.string().uuid()
});

class ChatController {
    async createChat(req: any, res: any) {
        try {
            const validation = createChatSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request data",
                    errors: validation.error.issues
                });
            }

            const { userAId, userBId } = validation.data;

            const result = await chatService.createOrGetPrivateChat(
                userAId,
                userBId
            );

            return res.status(result.isNew ? 201 : 200).json({
                success: true,
                message: result.isNew
                    ? "Chat created successfully!"
                    : " Existing chat retrived successfully",
                data: {
                    chatId: result.chat.id,
                    type: result.chat.type,
                    createdAt: result.chat.createdAt,
                    members: result.chat.members
                }
            });
        } catch (error: any) {
            if (error.message === "SELF_CHAT_NOT_ALLOWED") {
                return res.status(400).json({
                    success: false,
                    message: "Users cannot create a chat with themselves"
                });
            }

            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "One or both users do not exist"
                });
            }

            console.error("Create chat error", error);

            return res.status(500).json({
                success: false,
                message: "Internal server Error"
            });
        }
    }

    async getUserChats(req: any, res: any) {
        try {
            const userId = req.params.userId;
            const uuidSchema = z.string().uuid();
            const validation = uuidSchema.safeParse(userId);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalud user ID"
                });
            }

            const chats = await chatService.getUserChat(userId);

            return res.status(200).json({
                success: true,
                message: "User chat retrived successfully",
                total: chats.length,
                data: chats
            });
        } catch (error: any) {
            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                })
            }

            console.error("Get user chat error: ", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error."
            });
        }
    }

    async getChatById(req: any, res: any) {
        try {
            const chatId = req.params.chatId;

            const validation = z.string().uuid().safeParse(chatId);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid chat ID"
                });
            }

            const chat = await chatService.getChatById(chatId);

            return res.status(200).json({
                success: true,
                message: "Chat detailes retrived successfully!",
                data: chat
            })
        } catch (error: any) {
            if (error.message === "CHAT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found."
                })
            }
            console.error("Get chat details error: ", error);

            return res.status(500).json({
                success: false,
                messahe: "Internal server error"
            });
        }
    }

    async createGroupChat(req: any, res: any) {
        try {
            // Validate request body
            const groupChatSchema = z.object({
                name: z.string().trim().min(1).max(100),
                creatorId: z.string().uuid(),
                memberIds: z.array(z.string().uuid()),
            });

            const validation = groupChatSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid group chat details",
                    errors: validation.error.flatten(),
                });
            }

            const { name, creatorId, memberIds } = validation.data;

            const groupChat = await chatService.createGroupChat(
                name,
                creatorId,
                memberIds
            );

            return res.status(201).json({
                success: true,
                message: "Group chat created successfully",
                data: groupChat,
            });

        } catch (error: any) {
            if (error.message === "INVALID_GROUP_NAME") {
                return res.status(400).json({
                    success: false,
                    message: "Group name is required",
                });
            }

            if (error.message === "MINIMUM_GROUP_MEMBERS_REQUIRED") {
                return res.status(400).json({
                    success: false,
                    message: "A group must have at least 3 members including the creator",
                });
            }

            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "One or more users were not found",
                });
            }

            console.error("Create group chat error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create group chat",
            });
        }
    }

    async addGroupMembers(req: any, res: any) {
        try {
            const schema = z.object({
                requesterId: z.string().uuid(),
                memberIds: z.array(z.string().uuid()).min(1),
            });

            const validation = schema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: validation.error.flatten(),
                });
            }

            const { requesterId, memberIds } = validation.data;

            const result = await chatService.addGroupMembers(
                req.params.chatId,
                requesterId,
                memberIds
            );

            return res.status(200).json({
                success: true,
                message: "Group members added successfully",
                data: result,
            });

        } catch (error: any) {
            const errors: Record<string, number> = {
                CHAT_NOT_FOUND: 404,
                NOT_A_GROUP_CHAT: 400,
                USER_NOT_CHAT_MEMBER: 403,
                ADMIN_PERMISSION_REQUIRED: 403,
                USER_NOT_FOUND: 404,
                NO_NEW_MEMBERS: 400,
            };

            if (errors[error.message]) {
                return res.status(errors[error.message]).json({
                    success: false,
                    message: error.message,
                });
            }

            console.error("Add group members error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to add group members",
            });
        }
    }

    async removeGroupMember(req: any, res: any) {
        try {
            const schema = z.object({
                requesterId: z.string().uuid(),
            });

            const validation = schema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid requesterId",
                    errors: validation.error.flatten(),
                });
            }

            const result = await chatService.removeGroupMember(
                req.params.chatId,
                validation.data.requesterId,
                req.params.userId
            );

            return res.status(200).json({
                success: true,
                message: "Group member removed successfully",
                data: result,
            });

        } catch (error: any) {
            const errors: Record<string, number> = {
                CHAT_NOT_FOUND: 404,
                NOT_A_GROUP_CHAT: 400,
                USER_NOT_CHAT_MEMBER: 404,
                ADMIN_PERMISSION_REQUIRED: 403,
                CANNOT_REMOVE_SELF: 400,
                CANNOT_REMOVE_LAST_ADMIN: 400,
            };

            if (errors[error.message]) {
                return res.status(errors[error.message]).json({
                    success: false,
                    message: error.message,
                });
            }

            console.error("Remove group member error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to remove group member",
            });
        }
    }
}

module.exports = new ChatController()