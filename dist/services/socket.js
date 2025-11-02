"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("../utils/auth");
const database_1 = require("../utils/database");
const botService_1 = require("./botService");
class SocketService {
    constructor(server) {
        this.connectedUsers = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        // Initialize bot service (async, but we don't need to wait)
        botService_1.BotService.initialize().catch((error) => {
            console.error("Error initializing bot service:", error);
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error"));
            }
            const decoded = auth_1.Auth.verifyToken(token);
            if (!decoded) {
                return next(new Error("Invalid token"));
            }
            const user = await database_1.Database.findUserById(decoded.userId);
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.data.user = {
                userId: user.id,
                socketId: socket.id,
                username: user.username,
            };
            next();
        });
    }
    setupEventHandlers() {
        this.io.on("connection", async (socket) => {
            const user = socket.data.user;
            console.log(`User connected: ${user.username} (${user.userId})`);
            // Add user to connected users
            this.connectedUsers.set(user.userId, user);
            // Update user status to online
            await database_1.Database.updateUser(user.userId, {
                status: "online",
                lastSeen: new Date(),
            });
            // Notify other users that this user is online
            socket.broadcast.emit("userOnline", user.userId);
            // Send current user list to the connected user
            const users = (await database_1.Database.getUsers())
                .filter((u) => u.id !== user.userId)
                .map((u) => ({
                id: u.id,
                username: u.username,
                email: u.email,
                avatar: u.avatar,
                status: u.status,
                lastSeen: u.lastSeen,
            }));
            socket.emit("userList", users);
            // Handle joining a room (for private messaging)
            socket.on("join", (userId) => {
                const roomId = this.getRoomId(user.userId, userId);
                socket.join(roomId);
                console.log(`${user.username} joined room: ${roomId}`);
            });
            // Handle sending messages
            socket.on("message", async (data) => {
                try {
                    // Create and save message
                    const message = await database_1.Database.createMessage({
                        content: data.content,
                        senderId: user.userId,
                        receiverId: data.receiverId,
                        type: data.type || "text",
                    });
                    // Get receiver's socket info
                    const receiverSocket = this.connectedUsers.get(data.receiverId);
                    if (receiverSocket) {
                        // Send to receiver if online
                        this.io.to(receiverSocket.socketId).emit("message", message);
                    }
                    // Send back to sender for confirmation
                    socket.emit("message", message);
                    console.log(`Message sent from ${user.username} to ${data.receiverId}`);
                    // Check if receiver is a bot and handle bot response
                    if (await botService_1.BotService.isBotUser(data.receiverId)) {
                        botService_1.BotService.handleMessage(message, this.io);
                    }
                }
                catch (error) {
                    console.error("Error sending message:", error);
                }
            });
            // Handle typing indicators
            socket.on("typing", (data) => {
                const receiverSocket = this.connectedUsers.get(data.receiverId);
                if (receiverSocket) {
                    this.io.to(receiverSocket.socketId).emit("typing", {
                        userId: user.userId,
                        isTyping: data.isTyping,
                    });
                }
            });
            // Handle disconnection
            socket.on("disconnect", async () => {
                console.log(`User disconnected: ${user.username} (${user.userId})`);
                // Remove from connected users
                this.connectedUsers.delete(user.userId);
                // Update user status to offline
                await database_1.Database.updateUser(user.userId, {
                    status: "offline",
                    lastSeen: new Date(),
                });
                // Notify other users that this user is offline
                socket.broadcast.emit("userOffline", user.userId);
            });
        });
    }
    getRoomId(user1Id, user2Id) {
        // Create a consistent room ID by sorting user IDs
        const sortedIds = [user1Id, user2Id].sort();
        return `room_${sortedIds[0]}_${sortedIds[1]}`;
    }
    getIO() {
        return this.io;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socket.js.map