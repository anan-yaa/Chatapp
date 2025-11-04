import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import MessageInput from '../components/MessageInput';
import SettingsModal from '../components/SettingsModal';

const Chat = () => {
  const { user, token, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Helper function to sort chats by most recent message
  const sortChatsByRecency = (chats) => {
    return [...chats].sort((a, b) => {
      // If both have message times, sort by time (most recent first)
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      }
      // Chats with messages come first
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      // Both have messages or both don't - maintain current order
      return 0;
    });
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/chat/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const users = await response.json();
          // Convert users to chat format with last messages
          const userChats = users.map(u => ({
            id: u.id,
            name: u.username || u.email,
            lastMessage: u.lastMessage || '',
            lastMessageTime: u.lastMessageTime,
            unreadCount: 0,
            online: u.status === 'online',
          }));
          setChatList(userChats);
          console.log('Loaded users with messages:', userChats);
        } else {
          console.error('Failed to fetch users:', response.status);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Listen for incoming messages in real-time
    newSocket.on('message', (message) => {
      console.log('Received real-time message:', message);
      
      // Add message to current chat if it's relevant to the selected conversation
      if (selectedChat && 
          (message.senderId === selectedChat.id || message.receiverId === selectedChat.id)) {
        setMessages((prev) => [...prev, message]);
      }

      // Update chat list with new message (for both sender and receiver)
      setChatList((prevList) => {
        const updatedList = prevList.map((chat) => {
          if (chat.id === message.senderId || chat.id === message.receiverId) {
            return {
              ...chat,
              lastMessage: message.content,
              lastMessageTime: message.timestamp || new Date().toISOString(),
              unreadCount: chat.id === message.senderId && message.senderId !== user?.id
                ? (chat.unreadCount || 0) + 1
                : chat.unreadCount,
            };
          }
          return chat;
        });
        
        // Sort by most recent message
        return sortChatsByRecency(updatedList);
      });
    });

    newSocket.on('chatList', (chats) => {
      setChatList(chats);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, selectedChat, user]);

  const handleSendMessage = async (content) => {
    if (!selectedChat || !content.trim()) return;

    try {
      // Send via Socket.IO for real-time delivery
      if (socket) {
        socket.emit('message', {
          receiverId: selectedChat.id,
          content: content.trim(),
          type: 'text',
        });
        console.log('Message sent via socket:', selectedChat.id);
      } else {
        console.error('Socket not connected, message not sent in real-time');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setMessages([]); // Clear previous messages
    
    // Join the room for this chat
    if (socket) {
      socket.emit('join', chat.id);
      console.log('Joined room for chat:', chat.id);
    }
    
    // Load messages via REST API
    try {
      const response = await fetch(`http://localhost:3000/api/chat/messages/${chat.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const loadedMessages = await response.json();
        setMessages(loadedMessages);
        
        // Update chat list with the last message from history
        if (loadedMessages.length > 0) {
          const lastMessage = loadedMessages[loadedMessages.length - 1];
          setChatList((prevList) => {
            const updatedList = prevList.map((c) => {
              if (c.id === chat.id) {
                return {
                  ...c,
                  lastMessage: lastMessage.content,
                  lastMessageTime: lastMessage.timestamp,
                  unreadCount: 0, // Reset unread count when viewing
                };
              }
              return c;
            });
            return sortChatsByRecency(updatedList);
          });
        }
      } else {
        console.error('Failed to load messages:', response.status);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const filteredChats = chatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-chat-darker text-white font-sans h-screen overflow-hidden">
      <div className="flex h-screen">
        {/* Left Side Panel */}
        <div className="w-16 bg-gradient-to-b from-chat-gray to-chat-dark border-r border-chat-border flex flex-col items-center py-4">
          {/* Logo Icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-chat-blue to-chat-blue-light rounded-xl flex items-center justify-center shadow-lg shadow-chat-blue/30 mb-8">
            <i className="fas fa-comments text-white text-lg"></i>
          </div>

          {/* Navigation Icons */}
          <div className="flex flex-col gap-3">
            <button className="w-10 h-10 bg-chat-blue bg-opacity-20 hover:bg-opacity-30 rounded-lg border border-chat-blue border-opacity-30 transition-all duration-200 group flex items-center justify-center">
              <i className="fas fa-message text-chat-blue group-hover:text-chat-blue-light transition-colors"></i>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 bg-chat-dark hover:bg-chat-gray rounded-lg border border-chat-border transition-all duration-200 flex items-center justify-center"
              aria-label="Open settings"
            >
              <i className="fas fa-cog text-gray-400 hover:text-white transition-colors"></i>
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          chatList={filteredChats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-chat-dark via-chat-darker to-chat-dark">
          {selectedChat ? (
            <>
              <ChatHeader chat={selectedChat} />
              <ChatMessages messages={messages} currentUserId={user?.id} />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <i className="fas fa-comments text-6xl mb-4 opacity-20"></i>
                <p className="text-xl">Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onLogout={logout}
        />
      )}
    </div>
  );
};

export default Chat;
