import { User, Message } from "../types";
export declare class Database {
    static getUsers(): Promise<User[]>;
    static findUserByEmail(email: string): Promise<User | null>;
    static findUserById(id: string): Promise<User | null>;
    static createUser(user: Omit<User, "id">): Promise<User>;
    static updateUser(id: string, updates: Partial<User>): Promise<User | null>;
    static getMessages(): Promise<Message[]>;
    static createMessage(message: Omit<Message, "id" | "timestamp" | "read">): Promise<Message>;
    static getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]>;
    static markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map