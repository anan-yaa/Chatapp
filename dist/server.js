"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const socket_1 = require("./services/socket");
const mongodb_1 = require("./utils/mongodb");
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production" ? false : true,
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files (only for backend assets if needed)
// Frontend is served by React dev server (port 3002) or build folder
// app.use(express.static(path.join(__dirname, "../dist")));
// API routes
app.use("/api/auth", auth_1.default);
app.use("/api/chat", chat_1.default);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// Note: HTML routes removed - Frontend is now React app on port 3002
// React handles all frontend routing
// Initialize MongoDB connection
(0, mongodb_1.connectDB)().catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
});
// Initialize Socket.IO
const socketService = new socket_1.SocketService(server);
// Make socket.io available to routes
app.set('socketio', socketService.getIO());
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Start server
server.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Chat app available at http://localhost:${PORT}`);
    console.log(`🔐 Login page: http://localhost:${PORT}/login`);
    console.log(`📝 Signup page: http://localhost:${PORT}/signup`);
});
// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await (0, mongodb_1.disconnectDB)();
        console.log("Process terminated");
        process.exit(0);
    });
});
process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully");
    server.close(async () => {
        await (0, mongodb_1.disconnectDB)();
        console.log("Process terminated");
        process.exit(0);
    });
});
//# sourceMappingURL=server.js.map