"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const database_1 = require("../utils/database");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = auth_1.Auth.extractTokenFromHeader(authHeader || "");
    if (!token) {
        res.status(401).json({ error: "Access token required" });
        return;
    }
    const decoded = auth_1.Auth.verifyToken(token);
    if (!decoded) {
        res.status(403).json({ error: "Invalid or expired token" });
        return;
    }
    // Verify user still exists in database
    const user = await database_1.Database.findUserById(decoded.userId);
    if (!user) {
        res.status(403).json({ error: "User not found" });
        return;
    }
    req.user = decoded;
    next();
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map