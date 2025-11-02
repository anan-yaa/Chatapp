import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectDB, disconnectDB } from "../utils/mongodb";
import { UserModel } from "../models/User";
import { MessageModel } from "../models/Message";

// Load environment variables from .env file
dotenv.config();

interface JsonUser {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen: string | Date;
}

interface JsonMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string | Date;
  type: "text" | "image" | "file";
  read: boolean;
}

async function migrate(): Promise<void> {
  try {
    console.log("🚀 Starting migration from JSON to MongoDB...");

    // Connect to MongoDB
    await connectDB();

    const USERS_FILE = path.join(__dirname, "../data/users.json");
    const MESSAGES_FILE = path.join(__dirname, "../data/messages.json");

    // Check if files exist
    if (!fs.existsSync(USERS_FILE)) {
      console.log("⚠️  Users file not found, skipping user migration");
    } else {
      // Read and migrate users
      const usersData: JsonUser[] = JSON.parse(
        fs.readFileSync(USERS_FILE, "utf8")
      );

      console.log(`📦 Found ${usersData.length} users to migrate`);

      const userIdMap = new Map<string, string>(); // Old ID -> New MongoDB ID

      for (const user of usersData) {
        // Check if user already exists by email
        const existingUser = await UserModel.findOne({
          email: user.email.toLowerCase(),
        }).exec();

        if (existingUser) {
          console.log(`⏭️  User ${user.email} already exists, skipping...`);
          userIdMap.set(user.id, existingUser._id.toString());
          continue;
        }

        // Create new user in MongoDB
        const newUser = new UserModel({
          username: user.username,
          email: user.email.toLowerCase(),
          password: user.password,
          avatar: user.avatar,
          status: user.status || "offline",
          lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date(),
        });

        const savedUser = await newUser.save();
        userIdMap.set(user.id, savedUser._id.toString());
        console.log(`✅ Migrated user: ${user.username} (${user.email})`);
      }

      console.log(`✅ Successfully migrated ${userIdMap.size} users`);

      // Migrate messages
      if (!fs.existsSync(MESSAGES_FILE)) {
        console.log("⚠️  Messages file not found, skipping message migration");
      } else {
        const messagesData: JsonMessage[] = JSON.parse(
          fs.readFileSync(MESSAGES_FILE, "utf8")
        );

        console.log(`📦 Found ${messagesData.length} messages to migrate`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const message of messagesData) {
          // Map old sender/receiver IDs to new MongoDB IDs
          const newSenderId = userIdMap.get(message.senderId);
          const newReceiverId = userIdMap.get(message.receiverId);

          if (!newSenderId || !newReceiverId) {
            console.warn(
              `⚠️  Skipping message ${message.id}: sender or receiver ID not found in migrated users`
            );
            skippedCount++;
            continue;
          }

          // Check if message already exists (by content, sender, receiver, and timestamp)
          const existingMessage = await MessageModel.findOne({
            content: message.content,
            senderId: newSenderId,
            receiverId: newReceiverId,
            timestamp: new Date(message.timestamp),
          }).exec();

          if (existingMessage) {
            skippedCount++;
            continue;
          }

          // Create new message in MongoDB
          const newMessage = new MessageModel({
            content: message.content,
            senderId: newSenderId,
            receiverId: newReceiverId,
            timestamp: new Date(message.timestamp),
            type: message.type || "text",
            read: message.read || false,
          });

          await newMessage.save();
          migratedCount++;
        }

        console.log(
          `✅ Successfully migrated ${migratedCount} messages (${skippedCount} skipped)`
        );
      }
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await disconnectDB();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log("✅ Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrate };

