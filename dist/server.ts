import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Only needed if using ES modules. If using CommonJS, you already have __dirname and __filename.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files (JS, CSS, etc.) from ../dist
app.use(express.static(join(__dirname, "../dist")));

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../dist", "index.html"));
});

// Socket.IO chat logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
