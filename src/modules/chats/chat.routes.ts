
const express = require("express");
const router = express.Router();

const chatController = require("./chat.controller");

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Private chat management APIs
 */

/**
 * @swagger
 * /chat/create:
 *   post:
 *     summary: Create or retrieve a private chat
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userAId
 *               - userBId
 *             properties:
 *               userAId:
 *                 type: string
 *                 format: uuid
 *               userBId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       200:
 *         description: Existing chat retrieved
 *       400:
 *         description: Invalid request or self-chat
 *       404:
 *         description: User not found
 */
router.post("/create", chatController.createChat);


/**
 * @swagger
 * /chat/{chatId}:
 *   get:
 *     summary: Get chat details by ID
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chat details retrieved successfully
 *       400:
 *         description: Invalid chat ID
 *       404:
 *         description: Chat not found
 */

router.get("/:chatId", chatController.getChatById);


module.exports = router;
