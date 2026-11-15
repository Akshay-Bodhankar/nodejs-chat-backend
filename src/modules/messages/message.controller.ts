const messageService = require("./message.service");
const { z } = require("zod");

const sendMessageSchema = z.object({
    senderId: z.string().uuid(),
    text: z.string().trim().min(1).max(5000)
});

class MessageController {
    async sendMessage(req: any, res: any) {
        try {
            console.log(req.params)
            const chatIdValidation = z.string().uuid().safeParse(req.params.chatId);

            if (!chatIdValidation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid chat ID"
                });
            }

            const validation = sendMessageSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid message data",
                    errors: validation.error.issues
                });
            }

            const { senderId, text } = validation.data;
            const message = await messageService.sendMessage(
                req.params.chatId,
                senderId,
                text
            );
            return res.status(201).json({
                success: true,
                message: "Message sent succesfully",
                data: message
            });
        } catch (error: any) {
            if (error.message === "CHAT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }

            if (error.message === "NOT_CHAT_MEMBER") {
                return res.status(403).json({
                    success: false,
                    message: "Sender is not a member of this chat"
                });
            }

            console.error("Send message error: ", error);

            return res.status(500).json({
                success: false,
                message: "Failed to send message"
            });
        }
    }

    async getMessages(req: any, res: any) {
        try {
            const chatId = req.params.chatId;
            const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
            const messages = await messageService.getMessages(chatId, limit);

            return res.status(200).json({
                success: true,
                total: messages.length,
                data: messages
            });
        } catch (error: any) {
            if (error.message === "CHAT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    messgae: "Chat not found."
                });
            }
            console.log("Get message error: ", error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch messages"
            });
        }
    }

    async markMessageAsRead(req: any, res: any) {
        try {
            const { chatId, messageId } = req.params;
            const userId = req.body.userId;

            if (!userId || !z.string().uuid().safeParse(userId).success) {
                return res.status(400).json({
                    success: false,
                    message: "A valid userId is required",
                });
            }

            const result = await messageService.markMessageAsRead(chatId, messageId, userId);

            return res.status(200).json({
                success: true,
                message: "Message marked as read",
                data: result
            });
        } catch (error: any) {
            if (error.message === "CHAT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found",
                });
            }
            if (error.message === "MESSAGE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Message not found"
                });
            }

            if (error.message === "USER_NOT_CHAT_MEMBER") {
                return res.status(403).json({
                    success: false,
                    message: "User is not a member of this chat"
                });
            }

            console.log("Mark read error: ", error);

            return res.status(500).json({
                success: false,
                message: "Failed to mark message as read"
            });
        }
    }

    async updateLastSeen(req: any, res: any) {
        try {
            const { chatId } = req.params;
            const { userId, messageId } = req.body;

            const validation = z.object({
                userId: z.string().uuid(),
                messageId: z.string().min(1)
            }).safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: validation.error.flatten()
                });
            }

            const result = await messageService.updateLastSeen(chatId, userId, messageId);

            return res.status(200).json({
                success: true,
                message: "Last seen updated succesfully",
                data: result
            });
        } catch (error: any) {
            if (error.message === "CHAT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                })
            }
            if (error.message === "USER_NOT_CHAT_MEMBER") {
                return res.status(403).json({
                    success: false,
                    message: "User is not member of this chat"
                })
            }
            if (error.message === "MESSAGE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Message not found"
                })
            }

            console.error("Update last seen failed: ", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update last seen"
            });
        }
    }

    async editMessage(req: any, res: any) {
        try {
            const schema = z.object({
                senderId: z.string().uuid(),
                text: z.string().trim().min(1).max(5000),
            });

            const validation = schema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: validation.error.flatten(),
                });
            }

            const { senderId, text } = validation.data;
            const { chatId, messageId } = req.params;

            const result = await messageService.editMessage(
                chatId,
                messageId,
                senderId,
                text
            );

            return res.status(200).json({
                success: true,
                message: "Message updated successfully",
                data: result,
            });

        } catch (error: any) {
            const errors: Record<string, number> = {
                CHAT_NOT_FOUND: 404,
                MESSAGE_NOT_FOUND: 404,
                USER_NOT_CHAT_MEMBER: 403,
                NOT_MESSAGE_OWNER: 403,
                MESSAGE_ALREADY_DELETED: 400,
            };

            if (errors[error.message]) {
                return res.status(errors[error.message]).json({
                    success: false,
                    message: error.message,
                });
            }

            console.error("Edit message error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to edit message",
            });
        }
    }

    async deleteMessage(req: any, res: any) {
        try {
            const schema = z.object({
                senderId: z.string().uuid(),
            });

            const validation = schema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    errors: validation.error.flatten(),
                });
            }

            const { chatId, messageId } = req.params;
            const { senderId } = validation.data;

            const result = await messageService.deleteMessage(
                chatId,
                messageId,
                senderId
            );

            return res.status(200).json({
                success: true,
                message: "Message deleted successfully",
                data: result,
            });

        } catch (error: any) {
            const errors: Record<string, number> = {
                CHAT_NOT_FOUND: 404,
                MESSAGE_NOT_FOUND: 404,
                USER_NOT_CHAT_MEMBER: 403,
                NOT_MESSAGE_OWNER: 403,
                MESSAGE_ALREADY_DELETED: 400,
            };

            if (errors[error.message]) {
                return res.status(errors[error.message]).json({
                    success: false,
                    message: error.message,
                });
            }

            console.error("Delete message error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to delete message",
            });
        }
    }
}

module.exports = new MessageController();