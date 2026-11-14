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

            if(!validation.success) {
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
            if(error.message === "SELF_CHAT_NOT_ALLOWED") {
                return res.status(400).json({
                    success: false,
                    message: "Users cannot create a chat with themselves"
                });
            }

            if(error.message === "USER_NOT_FOUND") {
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
        try{
            const userId = req.params.userId;
            const uuidSchema = z.string().uuid();
            const validation = uuidSchema.safeParse(userId);

            if(!validation.success) {
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
            if(error.message === "USER_NOT_FOUND") {
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

            if(!validation.success) {
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
            if(error.message === "CHAT_NOT_FOUND"){
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
}

module.exports = new ChatController()