class ChatService {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.users = [];
    this.messages = [];
    this.currentChatUser = null;
    this.isTyping = false;
    this.typingTimeout = null;
  }

  async initialize() {
    if (!window.authService.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    this.currentUser = window.authService.getUser();
    await this.loadUsers();
    this.initializeSocket();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadUsers() {
    try {
      console.log("Loading users...");
      const response = await fetch("/api/chat/users", {
        headers: window.authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      this.users = await response.json();
      console.log("Loaded users:", this.users);
      this.renderUserList();
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  async loadMessages(userId) {
    try {
      console.log("Loading messages for user:", userId);
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: window.authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      this.messages = await response.json();
      console.log("Loaded messages:", this.messages);
      this.renderMessages();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  initializeSocket() {
    console.log("Initializing socket connection...");
    console.log("Auth token:", window.authService.getToken());

    // Check if Socket.IO is available
    if (typeof io === "undefined") {
      console.error(
        "Socket.IO not available! Make sure the server is running and Socket.IO client is loaded."
      );
      return;
    }

    this.socket = io({
      auth: {
        token: window.authService.getToken(),
      },
    });

    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    this.socket.on("message", (message) => {
      this.messages.push(message);
      this.renderMessages();
      this.updateUserList();
    });

    this.socket.on("userOnline", (userId) => {
      this.updateUserStatus(userId, "online");
    });

    this.socket.on("userOffline", (userId) => {
      this.updateUserStatus(userId, "offline");
    });

    this.socket.on("typing", (data) => {
      this.showTypingIndicator(data.userId, data.isTyping);
    });

    this.socket.on("userList", (users) => {
      this.users = users;
      this.renderUserList();
    });
  }

  setupEventListeners() {
    console.log("Setting up event listeners...");

    // Message input
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");

    console.log("Message input found:", !!messageInput);
    console.log("Send button found:", !!sendButton);

    if (messageInput && sendButton) {
      messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          console.log("Enter key pressed, calling sendMessage");
          this.sendMessage();
        }
      });

      messageInput.addEventListener("input", () => {
        this.handleTyping();
      });

      sendButton.addEventListener("click", () => {
        console.log("Send button clicked, calling sendMessage");
        this.sendMessage();
      });
    } else {
      console.error("Message input or send button not found!");
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterUsers(e.target.value);
      });
    }

    // Settings modal logic
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettings = document.getElementById("closeSettings");
    const displayNameForm = document.getElementById("displayNameForm");
    const displayNameInput = document.getElementById("displayName");
    const logoutBtn = document.getElementById("logoutBtn");

    // Open modal
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener("click", () => {
        console.log("Settings button clicked"); // DEBUG LOG
        settingsModal.classList.remove("hidden");
        settingsModal.classList.add("flex");
        // Set current display name
        if (displayNameInput && window.authService?.getUser()) {
          displayNameInput.value = window.authService.getUser().username;
        }
      });
    }
    // Close modal
    if (closeSettings && settingsModal) {
      closeSettings.addEventListener("click", () => {
        settingsModal.classList.remove("flex");
        settingsModal.classList.add("hidden");
      });
    }
    // Save display name
    if (displayNameForm && displayNameInput) {
      displayNameForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = displayNameInput.value.trim();
        if (!newName) return;
        // Update display name in localStorage and in-memory
        const user = window.authService.getUser();
        if (user) {
          user.username = newName;
          localStorage.setItem("user", JSON.stringify(user));
          // Optionally, update on server via API (not implemented here)
          this.currentUser = user;
          this.updateUI();
          this.renderUserList();
          if (this.currentChatUser && this.currentChatUser.id === user.id) {
            this.updateChatHeader();
          }
        }
        settingsModal.classList.add("hidden");
      });
    }
    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (this.socket) {
          this.socket.disconnect();
        }
        window.authService.logout();
      });
    }
  }

  sendMessage() {
    console.log("sendMessage called");
    const messageInput = document.getElementById("messageInput");
    const content = messageInput.value.trim();

    console.log("Content:", content);
    console.log("Current chat user:", this.currentChatUser);
    console.log("Socket connected:", this.socket?.connected);

    if (!content) {
      console.log("No content to send");
      return;
    }

    if (!this.currentChatUser) {
      console.log("No current chat user selected");
      return;
    }

    if (!this.socket?.connected) {
      console.log("Socket not connected");
      return;
    }

    console.log("Sending message:", {
      content,
      receiverId: this.currentChatUser.id,
      type: "text",
    });

    this.socket.emit("message", {
      content,
      receiverId: this.currentChatUser.id,
      type: "text",
    });

    messageInput.value = "";
    this.stopTyping();
  }

  handleTyping() {
    if (!this.currentChatUser) return;

    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit("typing", {
        receiverId: this.currentChatUser.id,
        isTyping: true,
      });
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  stopTyping() {
    if (!this.currentChatUser) return;

    this.isTyping = false;
    this.socket.emit("typing", {
      receiverId: this.currentChatUser.id,
      isTyping: false,
    });
  }

  selectUser(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    this.currentChatUser = user;
    console.log("Selected user:", user);
    this.loadMessages(userId);
    this.updateChatHeader();
    this.joinChat(userId);
    this.updateUI(); // Ensure input field is shown
  }

  joinChat(userId) {
    if (this.socket) {
      this.socket.emit("join", userId);
    }
  }

  renderUserList() {
    const userListContainer = document.querySelector(".chat-list");
    if (!userListContainer) return;

    userListContainer.innerHTML = this.users
      .filter((user) => user.id !== this.currentUser.id) // Don't show current user in list
      .map(
        (user) => `
      <div class="mb-2 user-list-item" data-user-id="${user.id}">
        <div class="flex items-center p-3 hover:bg-chat-gray rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-chat-blue hover:border-opacity-20">
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-chat-blue to-chat-blue-light rounded-full flex items-center justify-center font-semibold text-white shadow-lg">
              ${user.username.charAt(0).toUpperCase()}
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 ${
              user.status === "online" ? "bg-green-500" : "bg-gray-500"
            } rounded-full border-2 border-chat-darker"></div>
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-white truncate">${
                user.username
              }</h3>
              <span class="text-xs text-gray-400">${this.formatLastSeen(
                user.lastSeen
              )}</span>
            </div>
            <p class="text-sm text-gray-400 truncate">${
              user.status === "online" ? "Online" : "Offline"
            }</p>
          </div>
        </div>
      </div>
    `
      )
      .join("");
    this.attachUserListEventListeners();
  }

  attachUserListEventListeners() {
    const items = document.querySelectorAll(".user-list-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const userId = item.getAttribute("data-user-id");
        if (userId) {
          this.selectUser(userId);
        }
      });
    });
  }

  renderMessages() {
    const messagesContainer = document.querySelector(".chat-messages");
    if (!messagesContainer) return;

    if (!this.messages || this.messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center text-gray-400">
            <i class="fas fa-comments text-4xl mb-4"></i>
            <p>No messages yet. Start a conversation!</p>
          </div>
        </div>
      `;
      return;
    }

    messagesContainer.innerHTML = this.messages
      .map((message) => {
        const isOwnMessage = message.senderId === this.currentUser.id;
        const sender = isOwnMessage ? this.currentUser : this.currentChatUser;

        return `
        <div class="flex items-start gap-3 ${
          isOwnMessage ? "justify-end" : ""
        }">
          ${
            !isOwnMessage
              ? `
            <div class="w-8 h-8 bg-gradient-to-br from-chat-blue to-chat-blue-light rounded-full flex items-center justify-center font-semibold text-white text-sm shadow-lg">
              ${sender.username.charAt(0).toUpperCase()}
            </div>
          `
              : ""
          }
          <div class="flex flex-col max-w-xs ${
            isOwnMessage ? "items-end" : ""
          }">
            <div class="${
              isOwnMessage
                ? "bg-gradient-to-r from-chat-blue to-chat-blue-light"
                : "bg-chat-gray border border-chat-border"
            } rounded-2xl ${
          isOwnMessage ? "rounded-tr-md" : "rounded-tl-md"
        } px-4 py-3 shadow-lg">
              <p class="text-white">${this.escapeHtml(message.content)}</p>
            </div>
            <span class="text-xs text-gray-400 mt-1 ${
              isOwnMessage ? "mr-2" : "ml-2"
            }">${this.formatTime(message.timestamp)}</span>
          </div>
          ${
            isOwnMessage
              ? `
            <div class="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center font-semibold text-white text-sm shadow-lg">
              ${sender.username.charAt(0).toUpperCase()}
            </div>
          `
              : ""
          }
        </div>
      `;
      })
      .join("");

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  updateChatHeader() {
    if (!this.currentChatUser) return;

    const header = document.querySelector(".chat-header");
    if (header) {
      header.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-12 h-12 bg-gradient-to-br from-chat-blue to-chat-blue-light rounded-full flex items-center justify-center font-semibold text-white shadow-lg">
                ${this.currentChatUser.username.charAt(0).toUpperCase()}
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 ${
                this.currentChatUser.status === "online"
                  ? "bg-green-500"
                  : "bg-gray-500"
              } rounded-full border-2 border-chat-darker"></div>
            </div>
            <div>
              <h2 class="font-semibold text-white text-lg">${
                this.currentChatUser.username
              }</h2>
              <p class="text-sm ${
                this.currentChatUser.status === "online"
                  ? "text-green-400"
                  : "text-gray-400"
              }">${
        this.currentChatUser.status === "online" ? "Active now" : "Offline"
      }</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="w-10 h-10 bg-chat-dark hover:bg-chat-gray rounded-lg border border-chat-border transition-all duration-200 flex items-center justify-center group">
              <i class="fas fa-phone text-gray-400 group-hover:text-white transition-colors"></i>
            </button>
            <button class="w-10 h-10 bg-chat-dark hover:bg-chat-gray rounded-lg border border-chat-border transition-all duration-200 flex items-center justify-center group">
              <i class="fas fa-video text-gray-400 group-hover:text-white transition-colors"></i>
            </button>
            <button class="w-10 h-10 bg-chat-dark hover:bg-chat-gray rounded-lg border border-chat-border transition-all duration-200 flex items-center justify-center group">
              <i class="fas fa-ellipsis-v text-gray-400 group-hover:text-white transition-colors"></i>
            </button>
          </div>
        </div>
      `;
    }
  }

  updateUI() {
    console.log("Updating UI...");

    // Check if message input elements exist (they should be in HTML now)
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const messageInputContainer = document.querySelector(
      ".message-input-container"
    );
    console.log("Message input found:", !!messageInput);
    console.log("Send button found:", !!sendButton);

    if (!messageInput || !sendButton) {
      console.error("Message input or send button not found in HTML!");
    }

    // Show/hide message input based on user selection
    if (messageInputContainer) {
      if (!this.currentChatUser) {
        messageInputContainer.style.display = "none";
      } else {
        messageInputContainer.style.display = "";
      }
    }

    // Show welcome message if no user is selected
    if (!this.currentChatUser) {
      const messagesContainer = document.querySelector(".chat-messages");
      if (messagesContainer) {
        messagesContainer.innerHTML = `
          <div style="position: absolute; top: 50%; left: 62%; transform: translate(-50%, -50%); width: 100%;">
            <div class="flex flex-col items-center justify-center w-full">
              <i class="fas fa-users text-4xl mb-4"></i>
              <p class="text-center text-gray-400 text-lg">Select a user to start chatting</p>
            </div>
          </div>
        `;
      }
    }
  }

  filterUsers(searchTerm) {
    const userItems = document.querySelectorAll(".chat-list > div");
    userItems.forEach((item) => {
      const username = item.querySelector("h3").textContent.toLowerCase();
      if (username.includes(searchTerm.toLowerCase())) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }

  updateUserStatus(userId, status) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.status = status;
      this.renderUserList();
      if (this.currentChatUser && this.currentChatUser.id === userId) {
        this.updateChatHeader();
      }
    }
  }

  showTypingIndicator(userId, isTyping) {
    if (this.currentChatUser && this.currentChatUser.id === userId) {
      const typingIndicator = document.getElementById("typingIndicator");
      if (isTyping) {
        if (!typingIndicator) {
          const indicator = document.createElement("div");
          indicator.id = "typingIndicator";
          indicator.className = "text-sm text-gray-400 italic";
          indicator.textContent = "Typing...";
          document.querySelector(".chat-messages").appendChild(indicator);
        }
      } else {
        if (typingIndicator) {
          typingIndicator.remove();
        }
      }
    }
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  formatLastSeen(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chat service when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.chatService = new ChatService();
  window.chatService.initialize();
});
