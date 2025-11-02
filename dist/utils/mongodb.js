"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables (in case this module is imported before dotenv.config() in server.ts)
dotenv_1.default.config();
// Get MongoDB URI from environment variable
// For Atlas connections, include database name: mongodb+srv://user:pass@cluster.mongodb.net/databaseName?options
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";
const connectDB = async () => {
    try {
        // Re-read env variable to ensure it's loaded
        const uri = process.env.MONGODB_URI || MONGODB_URI;
        if (!uri || uri === "mongodb://localhost:27017/chatapp") {
            console.error("❌ MONGODB_URI is not set in environment variables!");
            console.error("💡 Please check your .env file in the project root");
            console.error("💡 Make sure it contains: MONGODB_URI=mongodb+srv://...");
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        console.log(`🔌 Attempting to connect to MongoDB...`);
        console.log(`📍 URI starts with: ${uri.substring(0, 30)}...`);
        // Connect with better error handling for Atlas
        const connectionOptions = {
            // These options help with Atlas connections
            serverSelectionTimeoutMS: 10000, // Timeout after 10s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };
        await mongoose_1.default.connect(uri, connectionOptions);
        console.log("✅ MongoDB connected successfully");
        console.log(`📊 Database: ${mongoose_1.default.connection.db?.databaseName || "Unknown"}`);
        console.log(`🌐 Host: ${mongoose_1.default.connection.host || "Unknown"}`);
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        console.error(`💡 Make sure MONGODB_URI is set in your .env file`);
        const uri = process.env.MONGODB_URI || MONGODB_URI;
        if (uri && uri.includes("mongodb+srv")) {
            console.error(`💡 For Atlas connections, ensure your connection string includes the database name`);
            console.error(`💡 Example: mongodb+srv://user:pass@cluster.mongodb.net/chatapp?retryWrites=true&w=majority`);
            console.error(`💡 Also check your MongoDB Atlas network access settings`);
        }
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log("✅ MongoDB disconnected successfully");
    }
    catch (error) {
        console.error("❌ MongoDB disconnection error:", error);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=mongodb.js.map