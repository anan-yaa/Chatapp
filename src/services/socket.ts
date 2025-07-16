import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { Auth } from "../utils/auth";
import { Database } from "../utils/database";
import { SocketUser, ChatMessage, Message } from "../types";
import { ServerToClientEvents, ClientToServerEvents } from "../types";
import { BotService } from "./botService";

export class SocketService {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Initialize bot service
    BotService.initialize();

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = Auth.verifyToken(token);
      if (!decoded) {
        return next(new Error("Invalid token"));
      }

      const user = Database.findUserById(decoded.userId);
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

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      const user = socket.data.user as SocketUser;

      console.log(`User connected: ${user.username} (${user.userId})`);

      // Add user to connected users
      this.connectedUsers.set(user.userId, user);

      // Update user status to online
      Database.updateUser(user.userId, {
        status: "online",
        lastSeen: new Date(),
      });

      // Notify other users that this user is online
      socket.broadcast.emit("userOnline", user.userId);

      // Send current user list to the connected user
      const users = Database.getUsers()
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
      socket.on("join", (userId: string) => {
        const roomId = this.getRoomId(user.userId, userId);
        socket.join(roomId);
        console.log(`${user.username} joined room: ${roomId}`);
      });

      // Handle sending messages
      socket.on("message", (data: ChatMessage) => {
        try {
          // Create and save message
          const message: Message = Database.createMessage({
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

          console.log(
            `Message sent from ${user.username} to ${data.receiverId}`
          );

          // Check if receiver is a bot and handle bot response
          if (BotService.isBotUser(data.receiverId)) {
            BotService.handleMessage(message, this.io);
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });

      // Handle typing indicators
      socket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
        const receiverSocket = this.connectedUsers.get(data.receiverId);
        if (receiverSocket) {
          this.io.to(receiverSocket.socketId).emit("typing", {
            userId: user.userId,
            isTyping: data.isTyping,
          });
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${user.username} (${user.userId})`);

        // Remove from connected users
        this.connectedUsers.delete(user.userId);

        // Update user status to offline
        Database.updateUser(user.userId, {
          status: "offline",
          lastSeen: new Date(),
        });

        // Notify other users that this user is offline
        socket.broadcast.emit("userOffline", user.userId);
      });
    });
  }

  private getRoomId(user1Id: string, user2Id: string): string {
    // Create a consistent room ID by sorting user IDs
    const sortedIds = [user1Id, user2Id].sort();
    return `room_${sortedIds[0]}_${sortedIds[1]}`;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
