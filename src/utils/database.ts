import fs from "fs";
import path from "path";
import { User, Message } from "../types";

const USERS_FILE = path.join(__dirname, "../data/users.json");
const MESSAGES_FILE = path.join(__dirname, "../data/messages.json");

export class Database {
  private static ensureFileExists(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf8");
    }
  }

  // User operations
  static getUsers(): User[] {
    this.ensureFileExists(USERS_FILE);
    const data = fs.readFileSync(USERS_FILE, "utf8");
    const users = JSON.parse(data);
    return users.map((user: any) => ({
      ...user,
      lastSeen: new Date(user.lastSeen),
    }));
  }

  static saveUsers(users: User[]): void {
    this.ensureFileExists(USERS_FILE);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  }

  static findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((user) => user.email === email);
  }

  static findUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find((user) => user.id === id);
  }

  static createUser(user: Omit<User, "id">): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: this.generateId(),
      status: "offline",
      lastSeen: new Date(),
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  // Message operations
  static getMessages(): Message[] {
    this.ensureFileExists(MESSAGES_FILE);
    const data = fs.readFileSync(MESSAGES_FILE, "utf8");
    const messages = JSON.parse(data);
    return messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  }

  static saveMessages(messages: Message[]): void {
    this.ensureFileExists(MESSAGES_FILE);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
  }

  static createMessage(
    message: Omit<Message, "id" | "timestamp" | "read">
  ): Message {
    const messages = this.getMessages();
    const newMessage: Message = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };
    messages.push(newMessage);
    this.saveMessages(messages);
    return newMessage;
  }

  static getMessagesBetweenUsers(user1Id: string, user2Id: string): Message[] {
    const messages = this.getMessages();
    return messages
      .filter(
        (message) =>
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  static markMessagesAsRead(senderId: string, receiverId: string): void {
    const messages = this.getMessages();
    const updatedMessages = messages.map((message) => {
      if (
        message.senderId === senderId &&
        message.receiverId === receiverId &&
        !message.read
      ) {
        return { ...message, read: true };
      }
      return message;
    });
    this.saveMessages(updatedMessages);
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}
