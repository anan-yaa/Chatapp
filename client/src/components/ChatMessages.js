import React, { useEffect, useRef } from 'react';

const ChatMessages = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-messages flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUserId;
          return (
            <div
              key={message.id || index}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-slideIn`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-gradient-to-r from-chat-blue to-chat-blue-light text-white rounded-br-none'
                    : 'bg-chat-gray text-white rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
