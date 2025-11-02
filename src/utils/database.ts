import { User, Message } from "../types";
import { UserModel } from "../models/User";
import { MessageModel } from "../models/Message";

export class Database {
  // User operations
  static async getUsers(): Promise<User[]> {
    const users = await UserModel.find({}).lean().exec();
    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      status: user.status,
      lastSeen:
        user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
    }));
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() })
      .lean()
      .exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      status: user.status,
      lastSeen:
        user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
    };
  }

  static async findUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).lean().exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      status: user.status,
      lastSeen:
        user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
    };
  }

  static async createUser(user: Omit<User, "id">): Promise<User> {
    const newUser = new UserModel({
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
      lastSeen:
        savedDoc.lastSeen instanceof Date
          ? savedDoc.lastSeen
          : new Date(savedDoc.lastSeen),
    };
  }

  static async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    )
      .lean()
      .exec();

    if (!user) return null;

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      status: user.status,
      lastSeen:
        user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen),
    };
  }

  // Message operations
  static async getMessages(): Promise<Message[]> {
    const messages = await MessageModel.find({})
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    return messages.map((message) => ({
      id: message._id.toString(),
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp),
      type: message.type,
      read: message.read,
    }));
  }

  static async createMessage(
    message: Omit<Message, "id" | "timestamp" | "read">
  ): Promise<Message> {
    console.log(
      `💾 [MongoDB] Saving message to database:`,
      message.content.substring(0, 50)
    );
    const newMessage = new MessageModel({
      ...message,
      timestamp: new Date(),
      read: false,
    });

    const savedMessage = await newMessage.save();
    const savedDoc = savedMessage.toObject();
    console.log(
      `✅ [MongoDB] Message saved with ID: ${savedDoc._id.toString()}`
    );

    return {
      id: savedDoc._id.toString(),
      content: savedDoc.content,
      senderId: savedDoc.senderId,
      receiverId: savedDoc.receiverId,
      timestamp:
        savedDoc.timestamp instanceof Date
          ? savedDoc.timestamp
          : new Date(savedDoc.timestamp),
      type: savedDoc.type,
      read: savedDoc.read,
    };
  }

  static async getMessagesBetweenUsers(
    user1Id: string,
    user2Id: string
  ): Promise<Message[]> {
    console.log(
      `📊 [MongoDB] Fetching messages between ${user1Id} and ${user2Id}`
    );
    const messages = await MessageModel.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    })
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    console.log(
      `✅ [MongoDB] Retrieved ${messages.length} messages from database`
    );
    return messages.map((message) => ({
      id: message._id.toString(),
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp),
      type: message.type,
      read: message.read,
    }));
  }

  static async markMessagesAsRead(
    senderId: string,
    receiverId: string
  ): Promise<void> {
    await MessageModel.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        read: false,
      },
      {
        $set: { read: true },
      }
    ).exec();
  }
}
