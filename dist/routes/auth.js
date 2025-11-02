"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../utils/auth");
const database_1 = require("../utils/database");
const router = (0, express_1.Router)();
// Register
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        // Validation
        if (!email || !password || !username) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters" });
        }
        // Check if user already exists
        const existingUser = await database_1.Database.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        // Hash password
        const hashedPassword = await auth_1.Auth.hashPassword(password);
        // Create user
        const user = await database_1.Database.createUser({
            email,
            password: hashedPassword,
            username,
            status: "offline",
            lastSeen: new Date(),
        });
        // Generate token
        const token = auth_1.Auth.generateToken(user);
        const response = {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                status: user.status,
                lastSeen: user.lastSeen,
            },
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        // Find user
        const user = await database_1.Database.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Verify password
        const isValidPassword = await auth_1.Auth.comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Update user status
        await database_1.Database.updateUser(user.id, { status: "online", lastSeen: new Date() });
        // Generate token
        const token = auth_1.Auth.generateToken(user);
        const response = {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                status: "online",
                lastSeen: new Date(),
            },
        };
        res.json(response);
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map