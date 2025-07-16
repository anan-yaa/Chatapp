"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../utils/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all users (excluding current user)
router.get("/users", auth_1.authenticateToken, (req, res) => {
    try {
        const users = database_1.Database.getUsers();
        const currentUserId = req.user?.userId;
        const filteredUsers = users
            .filter((user) => user.id !== currentUserId)
            .map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            status: user.status,
            lastSeen: user.lastSeen,
        }));
        res.json(filteredUsers);
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get messages between two users
router.get("/messages/:userId", auth_1.authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        const otherUserId = req.params.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const messages = database_1.Database.getMessagesBetweenUsers(currentUserId, otherUserId);
        res.json(messages);
    }
    catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Mark messages as read
router.post("/messages/:userId/read", auth_1.authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        const otherUserId = req.params.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        database_1.Database.markMessagesAsRead(otherUserId, currentUserId);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Mark messages as read error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get current user profile
router.get("/profile", auth_1.authenticateToken, (req, res) => {
    try {
        const currentUserId = req.user?.userId;
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = database_1.Database.findUserById(currentUserId);
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