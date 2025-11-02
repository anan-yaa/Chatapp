import React from 'react';

const ChatHeader = ({ chat }) => {
  if (!chat) return null;

  return (
    <div className="chat-header p-6 border-b border-chat-border bg-chat-gray bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-chat-blue to-chat-blue-light flex items-center justify-center text-white font-semibold shadow-lg">
          {chat.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{chat.name}</h2>
          <p className="text-sm text-gray-400">
            {chat.online ? (
              <>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Online
              </>
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
