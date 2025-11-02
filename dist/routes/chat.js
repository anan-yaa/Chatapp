"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../utils/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all users with last message (excluding current user)
router.get("/users", auth_1.authenticateToken, async (req, res) => {
    try {
        const users = await database_1.Database.getUsers();
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Get users with their last messages
        const usersWithMessages = await Promise.all(users
            .filter((user) => user.id !== currentUserId)
            .map(async (user) => {
            // Get last message between current user and this user
            const messages = await database_1.Database.getMessagesBetweenUsers(currentUserId, user.id);
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                status: user.status,
                lastSeen: user.lastSeen,
                lastMessage: lastMessage ? lastMessage.content : null,
                lastMessageTime: lastMessage ? lastMessage.timestamp : null,
            };
        }));
        // Sort by last message time (most recent first)
        usersWithMessages.sort((a, b) => {
            if (!a.lastMessageTime && !b.lastMessageTime)
                return 0;
            if (!a.lastMessageTime)
                return 1;
            if (!b.lastMessageTime)
                return -1;
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
        res.json(usersWithMessages);
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Send a message
router.post("/messages", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        const { recipientId, content } = req.body;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!recipientId || !content) {
            return res.status(400).json({ error: "Recipient and content are required" });
        }
        const message = await database_1.Database.createMessage({
            senderId: currentUserId,
            receiverId: recipientId,
            content,
            type: "text",
        });
        // Emit via Socket.IO for real-time delivery
        const io = req.app.get('socketio');
        if (io) {
            // Emit to both sender and recipient
            io.emit('message', message);
            console.log(`Real-time message emitted: ${currentUserId} -> ${recipientId}`);
        }
        res.status(201).json(message);
    }
    catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get messages between two users
router.get("/messages/:userId", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        const otherUserId = req.params.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const messages = await database_1.Database.getMessagesBetweenUsers(currentUserId, otherUserId);
        res.json(messages);
    }
    catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Mark messages as read
router.post("/messages/:userId/read", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        const otherUserId = req.params.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await database_1.Database.markMessagesAsRead(otherUserId, currentUserId);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Mark messages as read error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get current user profile
router.get("/profile", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await database_1.Database.findUserById(currentUserId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userProfile = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            status: user.status,
            lastSeen: user.lastSeen,
        };
        res.json(userProfile);
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map