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

            if(!chatIdValidation.success){
                return res.status(400).json({
                    success: false,
                    message: "Invalid chat ID"
                });
            }

            const validation = sendMessageSchema.safeParse(req.body);

            if(!validation.success)
            {
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
            if(error.message === "CHAT_NOT_FOUND"){
                return res.status(404).json({
                    success: false,
                    message: "Chat not found"
                });
            }

            if(error.message === "NOT_CHAT_MEMBER") {
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
}

module.exports = new MessageController();