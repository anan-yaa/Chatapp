import express from 'express';
import { createServer } from 'http';
import {Server, Socket} from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: { origin: "*" } 
});

// Track active users
const activeUsers = new Map<string, string>(); // socket.id → username

// Socket.io connection handler
io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Handle user login
  socket.on('login', (username: string) => {
    activeUsers.set(socket.id, username);
    console.log(`User ${username} logged in`);
    
    // Broadcast to all users that someone joined
    socket.broadcast.emit('user-joined', username);
  });

  // 2. Handle incoming messages
  socket.on('send-message', (message: string) => {
    const username = activeUsers.get(socket.id);
    if (!username) return; // Not logged in

    // Broadcast message to all clients
    io.emit('new-message', { 
      sender: username, 
      text: message,
      timestamp: new Date() 
    });
  });

  // 3. Handle disconnects
  socket.on('disconnect', () => {
    const username = activeUsers.get(socket.id);
    if (username) {
      activeUsers.delete(socket.id);
      socket.broadcast.emit('user-left', username);
      console.log(`User ${username} disconnected`);
    }
  });
});

// Start server
const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});