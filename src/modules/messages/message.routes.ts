
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

module.exports = router;
