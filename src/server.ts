import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import { SocketService } from "./services/socket";
import { connectDB, disconnectDB } from "./utils/mongodb";

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : true,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "../dist")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve HTML files
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/htmls/login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/htmls/signup.html"));
});

// Also serve HTML files directly from /htmls/ path
app.get("/htmls/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/htmls/signup.html"));
});

app.get("/htmls/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/htmls/login.html"));
});

app.get("/htmls/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/htmls/index.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/htmls/index.html"));
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/test.html"));
});

app.get("/bots", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/bots.html"));
});

// Initialize MongoDB connection
connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});

// Initialize Socket.IO
const socketService = new SocketService(server);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Chat app available at http://localhost:${PORT}`);
  console.log(`🔐 Login page: http://localhost:${PORT}/login`);
  console.log(`📝 Signup page: http://localhost:${PORT}/signup`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    console.log("Process terminated");
    process.exit(0);
  });
});
