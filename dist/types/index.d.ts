export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    status: "online" | "offline" | "away";
    lastSeen: Date;
}
export interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    timestamp: Date;
    type: "text" | "image" | "file";
    read: boolean;
}
export interface Chat {
    id: string;
    participants: string[];
    lastMessage?: Message;
    unreadCount: number;
}
export interface AuthRequest {
    email: string;
    password: string;
}
export interface RegisterRequest extends AuthRequest {
    username: string;
}
export interface AuthResponse {
    token: string;
    user: Omit<User, "password">;
}
export interface SocketUser {
    userId: string;
    socketId: string;
    username: string;
}
export interface ChatMessage {
    content: string;
    receiverId: string;
    type?: "text" | "image" | "file";
}
export interface ServerToClientEvents {
    message: (message: Message) => void;
    userOnline: (userId: string) => void;
    userOffline: (userId: string) => void;
    typing: (data: {
        userId: string;
        isTyping: boolean;
    }) => void;
    userList: (users: Omit<User, "password">[]) => void;
}
export interface ClientToServerEvents {
    message: (data: ChatMessage) => void;
    typing: (data: {
        receiverId: string;
        isTyping: boolean;
    }) => void;
    join: (userId: string) => void;
    disconnect: () => void;
}
//# sourceMappingURL=index.d.ts.map