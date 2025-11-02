"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const User_1 = require("../models/User");
const Message_1 = require("../models/Message");
class Database {
    // User operations
    static async getUsers() {
        const users = await User_1.UserModel.find({}).lean().exec();
        return users.map((user) => ({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            status: user.status,
            lastSeen: user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
        }));
    }
    static async findUserByEmail(email) {
        const user = await User_1.UserModel.findOne({ email: email.toLowerCase() }).lean().exec();
        if (!user)
            return null;
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            status: user.status,
            lastSeen: user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
        };
    }
    static async findUserById(id) {
        const user = await User_1.UserModel.findById(id).lean().exec();
        if (!user)
            return null;
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            status: user.status,
            lastSeen: user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
        };
    }
    static async createUser(user) {
        const newUser = new User_1.UserModel({
            ...user,
            email: user.email.toLowerCase(),
            status: user.status || "offline",
            lastSeen: user.lastSeen || new Date(),
        });
        const savedUser = await newUser.save();
        const savedDoc = savedUser.toObject();
        return {
            id: savedDoc._id.toString(),
            username: savedDoc.username,
            email: savedDoc.email,
            password: savedDoc.password,
            avatar: savedDoc.avatar,
            status: savedDoc.status,
            lastSeen: savedDoc.lastSeen instanceof Date ? savedDoc.lastSeen : new Date(savedDoc.lastSeen),
        };
    }
    static async updateUser(id, updates) {
        const user = await User_1.UserModel.findByIdAndUpdate(id, { ...updates }, { new: true, runValidators: true })
            .lean()
            .exec();
        if (!user)
            return null;
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            status: user.status,
            lastSeen: user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
        };
    }
    // Message operations
    static async getMessages() {
        const messages = await Message_1.MessageModel.find({})
            .sort({ timestamp: 1 })
            .lean()
            .exec();
        return messages.map((message) => ({
            id: message._id.toString(),
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp),
            type: message.type,
            read: message.read,
        }));
    }
    static async createMessage(message) {
        const newMessage = new Message_1.MessageModel({
            ...message,
            timestamp: new Date(),
            read: false,
        });
        const savedMessage = await newMessage.save();
        const savedDoc = savedMessage.toObject();
        return {
            id: savedDoc._id.toString(),
            content: savedDoc.content,
            senderId: savedDoc.senderId,
            receiverId: savedDoc.receiverId,
            timestamp: savedDoc.timestamp instanceof Date ? savedDoc.timestamp : new Date(savedDoc.timestamp),
            type: savedDoc.type,
            read: savedDoc.read,
        };
    }
    static async getMessagesBetweenUsers(user1Id, user2Id) {
        const messages = await Message_1.MessageModel.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id },
            ],
        })
            .sort({ timestamp: 1 })
            .lean()
            .exec();
        return messages.map((message) => ({
            id: message._id.toString(),
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp),
            type: message.type,
            read: message.read,
        }));
    }
    static async markMessagesAsRead(senderId, receiverId) {
        await Message_1.MessageModel.updateMany({
            senderId: senderId,
            receiverId: receiverId,
            read: false,
        }, {
            $set: { read: true },
        }).exec();
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map