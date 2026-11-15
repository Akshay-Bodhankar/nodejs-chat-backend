
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


/**
 * @swagger
 * /chat/group/create:
 *   post:
 *     summary: Create a group chat
 *     description: Creates a group chat and assigns the creator as ADMIN.
 *     tags:
 *       - Chats
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - creatorId
 *               - memberIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: Development Team
 *               creatorId:
 *                 type: string
 *                 format: uuid
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *           example:
 *             name: Development Team
 *             creatorId: "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *             memberIds:
 *               - "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *               - "550e8400-e29b-41d4-a716-446655440000"
 *               - "6ba7b810-9dad-41d1-80b4-00c04fd430c8"
 *     responses:
 *       201:
 *         description: Group chat created successfully
 *       400:
 *         description: Invalid group details or minimum members not met
 *       404:
 *         description: One or more users not found
 *       500:
 *         description: Internal server error
 */
router.post("/group/create", chatController.createGroupChat);

/**
 * @swagger
 * /chat/{chatId}/members:
 *   post:
 *     summary: Add members to a group chat
 *     tags:
 *       - Chats
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
 *               - requesterId
 *               - memberIds
 *             properties:
 *               requesterId:
 *                 type: string
 *                 format: uuid
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *           example:
 *             requesterId: "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *             memberIds:
 *               - "804c824c-7771-48b4-adec-a5891e3ba267"
 *     responses:
 *       200:
 *         description: Group members added successfully
 *       400:
 *         description: Invalid request or not a group chat
 *       403:
 *         description: Admin permission required
 *       404:
 *         description: Chat or user not found
 */
router.post(
  "/:chatId/members",
  chatController.addGroupMembers
);

/**
 * @swagger
 * /chat/{chatId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a group chat
 *     tags:
 *       - Chats
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
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
 *               - requesterId
 *             properties:
 *               requesterId:
 *                 type: string
 *                 format: uuid
 *           example:
 *             requesterId: "b3b57c8a-abb3-478b-9e9d-99b6b3c799dc"
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Invalid operation
 *       403:
 *         description: Admin permission required
 *       404:
 *         description: Chat or member not found
 */
router.delete(
  "/:chatId/members/:userId",
  chatController.removeGroupMember
);

module.exports = router;
