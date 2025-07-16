import { User, Message } from "../types";
export declare class Database {
    private static ensureFileExists;
    static getUsers(): User[];
    static saveUsers(users: User[]): void;
    static findUserByEmail(email: string): User | undefined;
    static findUserById(id: string): User | undefined;
    static createUser(user: Omit<User, "id">): User;
    static updateUser(id: string, updates: Partial<User>): User | null;
    static getMessages(): Message[];
    static saveMessages(messages: Message[]): void;
    static createMessage(message: Omit<Message, "id" | "timestamp" | "read">): Message;
    static getMessagesBetweenUsers(user1Id: string, user2Id: string): Message[];
    static markMessagesAsRead(senderId: string, receiverId: string): void;
    private static generateId;
}
//# sourceMappingURL=database.d.ts.map