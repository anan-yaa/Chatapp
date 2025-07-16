"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const USERS_FILE = path_1.default.join(__dirname, "../data/users.json");
const MESSAGES_FILE = path_1.default.join(__dirname, "../data/messages.json");
class Database {
    static ensureFileExists(filePath) {
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, "[]", "utf8");
        }
    }
    // User operations
    static getUsers() {
        this.ensureFileExists(USERS_FILE);
        const data = fs_1.default.readFileSync(USERS_FILE, "utf8");
        const users = JSON.parse(data);
        return users.map((user) => ({
            ...user,
            lastSeen: new Date(user.lastSeen),
        }));
    }
    static saveUsers(users) {
        this.ensureFileExists(USERS_FILE);
        fs_1.default.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    }
    static findUserByEmail(email) {
        const users = this.getUsers();
        return users.find((user) => user.email === email);
    }
    static findUserById(id) {
        const users = this.getUsers();
        return users.find((user) => user.id === id);
    }
    static createUser(user) {
        const users = this.getUsers();
        const newUser = {
            ...user,
            id: this.generateId(),
            status: "offline",
            lastSeen: new Date(),
        };
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }
    static updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex((user) => user.id === id);
        if (index === -1)
            return null;
        users[index] = { ...users[index], ...updates };
        this.saveUsers(users);
        return users[index];
    }
    // Message operations
    static getMessages() {
        this.ensureFileExists(MESSAGES_FILE);
        const data = fs_1.default.readFileSync(MESSAGES_FILE, "utf8");
        const messages = JSON.parse(data);
        return messages.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
        }));
    }
    static saveMessages(messages) {
        this.ensureFileExists(MESSAGES_FILE);
        fs_1.default.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
    }
    static createMessage(message) {
        const messages = this.getMessages();
        const newMessage = {
            ...message,
            id: this.generateId(),
            timestamp: new Date(),
            read: false,
        };
        messages.push(newMessage);
        this.saveMessages(messages);
        return newMessage;
    }
    static getMessagesBetweenUsers(user1Id, user2Id) {
        const messages = this.getMessages();
        return messages
            .filter((message) => (message.senderId === user1Id && message.receiverId === user2Id) ||
            (message.senderId === user2Id && message.receiverId === user1Id))
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
    static markMessagesAsRead(senderId, receiverId) {
        const messages = this.getMessages();
        const updatedMessages = messages.map((message) => {
            if (message.senderId === senderId &&
                message.receiverId === receiverId &&
                !message.read) {
                return { ...message, read: true };
            }
            return message;
        });
        this.saveMessages(updatedMessages);
    }
    static generateId() {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map