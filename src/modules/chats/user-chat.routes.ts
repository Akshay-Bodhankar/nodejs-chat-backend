
const express = require("express");
const router = express.Router();

const chatController = require("./chat.controller");

/**
 * @swagger
 * /user/{userId}/chats:
 *   get:
 *     summary: Get all chats belonging to a user
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User chats retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 */
router.get("/:userId/chats", chatController.getUserChats);

module.exports = router;
