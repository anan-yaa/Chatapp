import React from 'react';

const Sidebar = ({ chatList, selectedChat, onSelectChat, searchTerm, onSearchChange }) => {
  return (
    <div className="w-80 bg-gradient-to-b from-chat-gray to-chat-dark border-r border-chat-border flex flex-col relative">
      {/* Gradient border effect */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-chat-blue to-transparent"></div>

      {/* Header */}
      <div className="p-6 border-b border-chat-border bg-chat-blue bg-opacity-10">
        {/* Logo Text */}
        <div className="flex items-center justify-between mb-4">
          <img src="/Drift.png" alt="Drift Logo" className="w-18 h-8 shadow-md" />
        </div>

        {/* Search */}
        <div className="search-container relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            id="searchInput"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-chat-dark border border-chat-border rounded-xl focus:outline-none focus:ring-2 focus:ring-chat-blue focus:border-transparent placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Recent Chats
          </h2>

          <div className="chat-list relative overflow-y-auto custom-scrollbar" style={{ minHeight: '200px' }}>
            {chatList.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-center px-4">
                <i className="fas fa-users text-4xl mb-3 opacity-20"></i>
                <p className="text-sm">No other users available yet</p>
                <p className="text-xs mt-2 opacity-70">Create another account to start chatting!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatList.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                      selectedChat?.id === chat.id
                        ? 'bg-chat-blue bg-opacity-20 border border-chat-blue'
                        : 'bg-chat-dark hover:bg-chat-gray border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-chat-blue to-chat-blue-light flex items-center justify-center text-white font-semibold">
                        {chat.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{chat.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{chat.lastMessage || 'No messages yet'}</p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-chat-blue text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
