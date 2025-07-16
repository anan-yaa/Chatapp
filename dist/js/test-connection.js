// Test connection script
console.log("Testing connection...");

// Test if Socket.IO is loaded
if (typeof io === "undefined") {
  console.error("❌ Socket.IO not loaded!");
} else {
  console.log("✅ Socket.IO loaded successfully");
}

// Test server connection
fetch("/api/health")
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Server is running:", data);
  })
  .catch((error) => {
    console.error("❌ Server connection failed:", error);
  });

// Test Socket.IO connection
if (typeof io !== "undefined") {
  const socket = io();

  socket.on("connect", () => {
    console.log("✅ Socket.IO connected successfully!");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket.IO connection error:", error);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket.IO disconnected");
  });
}
