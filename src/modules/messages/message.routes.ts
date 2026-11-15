
const express = require("express");
const router = express.Router();

const messageController = require("./message.controller");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat messaging APIs
 */

/**
 * @swagger
 * /chat/{chatId}/message/send:
 *   post:
 *     summary: Send a message to a chat
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - text
 *             properties:
 *               senderId:
 *                 type: string
 *                 format: uuid
 *               text:
 *                 type: string
 *                 example: Hello! How are you?
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Sender is not a chat member
 *       404:
 *         description: Chat not found
 */
router.post("/:chatId/message/send", messageController.sendMessage);

/**
 * @swagger
 * /chat/{chatId}/messages:
 *   get:
 *     summary: Get messages from a chat
 *     description: Retrieves messages from a chat in chronological order.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the chat
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of messages to retrieve
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       messageId:
 *                         type: string
 *                         example: firestore-message-id
 *                       senderId:
 *                         type: string
 *                         format: uuid
 *                       text:
 *                         type: string
 *                         example: Hello!
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       editedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get("/:chatId/messages", messageController.getMessages);

/**
 * @swagger
 * /chat/{chatId}/message/{messageId}/read:
 *   post:
 *     summary: Mark a message as read
 *     description: Records a read receipt for a specific user on a message.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the chat
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Firestore message document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user who read the message
 *             example:
 *               userId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Message marked as read
 *               data:
 *                 messageId: "firestore-message-id"
 *                 userId: "550e8400-e29b-41d4-a716-446655440000"
 *                 status: READ
 *       400:
 *         description: Invalid or missing userId
 *       403:
 *         description: User is not a member of this chat
 *       404:
 *         description: Chat or message not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:chatId/message/:messageId/read",
  messageController.markMessageAsRead
);



/**
 * @swagger
 * /chat/{chatId}/lastseen:
 *   post:
 *     summary: Update user's last seen status
 *     description: Updates the last message seen and timestamp for a chat member.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - messageId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               messageId:
 *                 type: string
 *             example:
 *               userId: "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *               messageId: "firestore-message-id"
 *     responses:
 *       200:
 *         description: Last seen updated successfully
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: User is not a member of this chat
 *       404:
 *         description: Chat or message not found
 *       500:
 *         description: Internal server error
 */

router.post(
  "/:chatId/lastseen",
  messageController.updateLastSeen
);

/**
 * @swagger
 * /chat/{chatId}/message/{messageId}/edit:
 *   put:
 *     summary: Edit an existing message
 *     description: Only the original sender can edit their message.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - text
 *             properties:
 *               senderId:
 *                 type: string
 *                 format: uuid
 *               text:
 *                 type: string
 *                 maxLength: 5000
 *           example:
 *             senderId: "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *             text: "This is my corrected message"
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       400:
 *         description: Invalid input or message already deleted
 *       403:
 *         description: User is not the original sender
 *       404:
 *         description: Chat or message not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:chatId/message/:messageId/edit",
  messageController.editMessage
);

/**
 * @swagger
 * /chat/{chatId}/message/{messageId}/delete:
 *   delete:
 *     summary: Delete a message
 *     description: Only the original sender can delete their message. Uses soft deletion.
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *             properties:
 *               senderId:
 *                 type: string
 *                 format: uuid
 *           example:
 *             senderId: "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       400:
 *         description: Invalid request or message already deleted
 *       403:
 *         description: Only the original sender can delete the message
 *       404:
 *         description: Chat or message not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:chatId/message/:messageId/delete",
  messageController.deleteMessage
);

module.exports = router;