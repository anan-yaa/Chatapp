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
    await this.loadAllMessages(); 
    this.initializeSocket();
    this.setupEventListeners();
    this.updateUI();

    // Ensure emoji picker is hidden on initialization
    const emojiPicker = document.getElementById("emojiPicker");
    if (emojiPicker) {
      emojiPicker.classList.add("hidden");
      emojiPicker.style.display = "none";
    }
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

  async loadAllMessages() {
    try {
      // Load messages for all users
      const promises = this.users.map((user) =>
        fetch(`/api/chat/messages/${user.id}`, {
          headers: window.authService.getAuthHeaders(),
        }).then((response) => response.json())
      );

      const allMessages = await Promise.all(promises);
      this.messages = allMessages.flat();
    } catch (error) {
      console.error("Error loading all messages:", error);
    }
  }

  // Update the existing loadMessages method
  async loadMessages(userId) {
    try {
      console.log("Loading messages for user:", userId);
      const response = await fetch(`/api/chat/messages/${userId}`, {
        headers: window.authService.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const messages = await response.json();

      // Update messages for this conversation
      this.messages = messages;

      console.log("Loaded messages:", messages);
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
      console.log("Connected to server via Socket.IO");
      // Join all existing conversations on reconnect
      if (this.users && this.users.length > 0) {
        this.users.forEach((user) => {
          this.socket.emit("join", user.id);
        });
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Update message handling to prevent duplicates
    this.socket.on("message", (message) => {
      console.log("New message received:", message);

      // Check if message is between current user and another user
      const isRelevantMessage =
        message.senderId === this.currentUser.id ||
        message.receiverId === this.currentUser.id;

      if (isRelevantMessage) {
        // Check if message already exists (prevent duplicates)
        const messageExists = this.messages.some(
          (msg) => msg.id === message.id
        );

        if (!messageExists) {
          this.messages.push(message);
          
          // If this is for the current chat, render immediately for real-time update
          if (
            this.currentChatUser &&
            (message.senderId === this.currentChatUser.id ||
              message.receiverId === this.currentChatUser.id)
          ) {
            // Render immediately for instant feedback
            this.renderMessages();
          }
        } else {
          // Message exists, might be a duplicate - refresh from server to ensure consistency
          if (
            this.currentChatUser &&
            (message.senderId === this.currentChatUser.id ||
              message.receiverId === this.currentChatUser.id)
          ) {
            this.loadMessages(this.currentChatUser.id).then(() => {
              this.renderMessages();
            });
          }
        }
      }

      // Always update the user list to reflect new message order
      this.renderUserList();
    });

    this.socket.on("userOnline", (userId) => {
      this.updateUserStatus(userId, "online");
      this.renderUserList(); // Re-render to show online status
    });

    this.socket.on("userOffline", (userId) => {
      this.updateUserStatus(userId, "offline");
      this.renderUserList(); // Re-render to show offline status
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

    // Message input and emoji
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const emojiButton = document.getElementById("emojiButton");
    const emojiPicker = document.getElementById("emojiPicker");

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

    // Emoji picker functionality
    if (emojiButton && messageInput) {
      const emojiCategories = {
        smileys: [
          "😀",
          "😃",
          "😄",
          "😁",
          "😅",
          "😂",
          "🤣",
          "😊",
          "😇",
          "🙂",
          "🙃",
          "😉",
          "😌",
          "😍",
          "🥰",
          "😘",
          "😗",
          "😙",
          "😚",
          "😋",
          "😛",
          "😝",
          "😜",
          "🤪",
          "🤨",
          "🧐",
          "🤓",
          "😎",
          "🥸",
          "🤩",
          "🥳",
          "😏",
          "😒",
          "😞",
          "😔",
          "😟",
          "😕",
          "🙁",
          "☹️",
          "😣",
          "😖",
          "😫",
          "😩",
          "🥺",
          "😢",
          "😭",
          "😤",
          "😠",
          "😡",
          "🤬",
          "🤯",
          "😳",
          "🥵",
          "🥶",
          "😱",
          "😨",
          "😰",
          "😥",
          "😓",
          "🤗",
          "🤔",
          "🤭",
          "🤫",
          "🤥",
          "😶",
          "😐",
          "😑",
          "😬",
          "🙄",
          "😯",
          "😦",
          "😧",
          "😮",
          "😲",
          "🥱",
          "😴",
          "🤤",
          "😪",
          "😵",
          "🤐",
          "🥴",
          "🤢",
          "🤮",
          "🤧",
          "😷",
          "🤒",
          "🤕",
        ],
        gestures: [
          "👋",
          "🤚",
          "✋",
          "🖐️",
          "👌",
          "🤌",
          "🤏",
          "✌️",
          "🤞",
          "🤟",
          "🤘",
          "🤙",
          "👈",
          "👉",
          "👆",
          "👇",
          "☝️",
          "👍",
          "👎",
          "✊",
          "👊",
          "🤛",
          "🤜",
          "👏",
          "🙌",
          "👐",
          "🤲",
          "🤝",
          "🙏",
          "💪",
          "🦾",
          "🖕",
          "✍️",
          "🤳",
          "💅",
          "🦵",
          "🦿",
          "🦶",
          "👂",
          "🦻",
          "👃",
          "🧠",
          "🫀",
          "🫁",
          "🦷",
          "🦴",
          "👀",
          "👁️",
          "👅",
          "👄",
          "🫦",
          "💋",
          "🩸",
        ],
        hearts: [
          "❤️",
          "🧡",
          "💛",
          "💚",
          "💙",
          "💜",
          "🤎",
          "🖤",
          "🤍",
          "💔",
          "❣️",
          "💕",
          "💞",
          "💓",
          "💗",
          "💖",
          "💘",
          "💝",
          "💟",
          "♥️",
          "💌",
          "💋",
          "👥",
          "👤",
          "🗣️",
          "🫂",
          "💑",
          "👩‍❤️‍👩",
          "👨‍❤️‍👨",
          "💏",
          "👩‍❤️‍💋‍👩",
          "👨‍❤️‍💋‍👨",
          "🤍",
          "💘",
          "💝",
          "💖",
          "💗",
          "💓",
          "💞",
          "💕",
          "💟",
        ],
      };

      let currentCategory = "smileys";

      const closeEmojiPicker = () => {
        console.log("Closing emoji picker"); // Debug log
        const emojiPicker = document.getElementById("emojiPicker");
        if (emojiPicker) {
          emojiPicker.classList.add("hidden");
          emojiPicker.style.display = "none";
        }
      };

      const openEmojiPicker = () => {
        const emojiPicker = document.getElementById("emojiPicker");
        if (emojiPicker) {
          emojiPicker.classList.remove("hidden");
          emojiPicker.style.display = "block";
          renderEmojiGrid(currentCategory);
        }
      };

      const renderEmojiGrid = (category) => {
        const emojiGrid = document.querySelector(".emoji-grid");
        if (!emojiGrid) return;

        const emojis = emojiCategories[category];
        emojiGrid.innerHTML = emojis
          .map(
            (emoji) => `
          <button class="p-2 text-xl hover:bg-chat-gray rounded-lg transition-colors duration-200 emoji-btn">
            ${emoji}
          </button>
        `
          )
          .join("");
      };

      // Category button click handlers
      const categoryButtons = document.querySelectorAll(".emoji-category-btn");
      categoryButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const category = btn.dataset.category;

          // Update active state
          categoryButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          // Render emojis for selected category
          currentCategory = category;
          renderEmojiGrid(category);
        });
      });

      // Initialize close button handler
      const initializeCloseButton = () => {
        console.log("Initializing close button"); // Debug log
        const closeButton = document.getElementById("closeEmojiPicker");
        console.log("Close button found:", !!closeButton); // Debug log

        if (closeButton) {
          // Remove any existing listeners
          closeButton.replaceWith(closeButton.cloneNode(true));

          // Get the fresh element
          const freshCloseButton = document.getElementById("closeEmojiPicker");

          // Add new click listener
          freshCloseButton.addEventListener("click", (e) => {
            console.log("Close button clicked"); // Debug log
            e.preventDefault();
            e.stopPropagation();
            closeEmojiPicker();
          });
        }
      };

      emojiButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const emojiPicker = document.getElementById("emojiPicker");
        const isVisible = emojiPicker.style.display === "block";

        if (isVisible) {
          closeEmojiPicker();
        } else {
          openEmojiPicker();
        }
      });

      // Emoji click handler
      document.querySelector(".emoji-grid").addEventListener("click", (e) => {
        const emojiBtn = e.target.closest(".emoji-btn");
        if (emojiBtn) {
          e.stopPropagation();
          const emoji = emojiBtn.textContent.trim();
          const cursorPos = messageInput.selectionStart;
          const textBefore = messageInput.value.substring(0, cursorPos);
          const textAfter = messageInput.value.substring(cursorPos);

          messageInput.value = textBefore + emoji + textAfter;
          messageInput.focus();
          messageInput.selectionStart = cursorPos + emoji.length;
          messageInput.selectionEnd = cursorPos + emoji.length;

          closeEmojiPicker();
        }
      });

      // Close emoji picker when clicking outside
      document.addEventListener("click", (e) => {
        const emojiPicker = document.getElementById("emojiPicker");
        if (
          emojiPicker &&
          !emojiPicker.contains(e.target) &&
          e.target !== emojiButton
        ) {
          closeEmojiPicker();
        }
      });

      // Prevent closing when clicking inside the picker
      const emojiPicker = document.getElementById("emojiPicker");
      if (emojiPicker) {
        emojiPicker.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }

      // Initialize close button on page load
      initializeCloseButton();
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.filterUsers(e.target.value);
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        console.log("Logout button clicked");
        if (this.socket) {
          this.socket.disconnect();
        }
        window.authService.logout();
      });
    }

    // Settings modal logic
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettings = document.getElementById("closeSettings");
    const displayNameForm = document.getElementById("displayNameForm");
    const displayNameInput = document.getElementById("displayName");

    // Open modal
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener("click", () => {
        settingsModal.style.display = "block";
        // Set current display name
        if (displayNameInput && window.authService?.getUser()) {
          displayNameInput.value = window.authService.getUser().username;
        }
      });
    }
    // Close modal
    if (closeSettings && settingsModal) {
      closeSettings.addEventListener("click", () => {
        settingsModal.style.display = "none";
      });
    }
    // Save display name
    if (displayNameForm && displayNameInput) {
      displayNameForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newName = displayNameInput.value.trim();
        if (!newName) return;
        const user = window.authService.getUser();
        if (user) {
          user.username = newName;
          localStorage.setItem("user", JSON.stringify(user));
          this.currentUser = user;
          this.updateUI();
          this.renderUserList();
          if (this.currentChatUser && this.currentChatUser.id === user.id) {
            this.updateChatHeader();
          }
        }
        settingsModal.style.display = "none";
      });
    }
  }

  sendMessage() {
    console.log("sendMessage called");
    const messageInput = document.getElementById("messageInput");
    const content = messageInput.value.trim();

    if (!content || !this.currentChatUser || !this.socket?.connected) {
      console.log("Cannot send message - missing content, user, or socket");
      return;
    }

    const messageData = {
      content,
      receiverId: this.currentChatUser.id,
      type: "text",
    };

    console.log("Sending message:", messageData);

    // Clear input immediately
    messageInput.value = "";
    this.stopTyping();

    // Send message through socket
    this.socket.emit("message", messageData);
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

    // Load messages for this user
    this.loadMessages(userId).then(() => {
      this.renderMessages();
    });

    this.updateChatHeader();
    this.joinChat(userId);
    this.updateUI();
  }

  joinChat(userId) {
    if (this.socket) {
      this.socket.emit("join", userId);
    }
  }

  renderUserList() {
    const userListContainer = document.querySelector(".chat-list");
    if (!userListContainer) return;

    // Get all users except current user
    const otherUsers = this.users.filter(
      (user) => user.id !== this.currentUser.id
    );

    // Get latest message timestamp for each user
    const userLastMessages = otherUsers.map((user) => {
      const messages = this.messages.filter(
        (msg) =>
          (msg.senderId === user.id &&
            msg.receiverId === this.currentUser.id) ||
          (msg.senderId === this.currentUser.id && msg.receiverId === user.id)
      );
      const latestMessage =
        messages.length > 0
          ? messages.reduce((latest, msg) =>
              new Date(msg.timestamp) > new Date(latest.timestamp)
                ? msg
                : latest
            )
          : null;
      return {
        user,
        lastMessageTime: latestMessage
          ? new Date(latestMessage.timestamp)
          : new Date(0),
      };
    });

    // Sort users by latest message timestamp, most recent first
    userLastMessages.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    userListContainer.innerHTML = userLastMessages
      .map(
        ({ user }) => `
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

    // Sort messages by timestamp
    const sortedMessages = [...this.messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    messagesContainer.innerHTML = sortedMessages
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
              <p class="text-white break-words">${this.escapeHtml(
                message.content
              )}</p>
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

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  updateChatHeader() {
    if (!this.currentChatUser) return;

    const header = document.querySelector(".chat-header");
    if (header) {
      header.innerHTML = `
        <div class="flex items-center">
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
