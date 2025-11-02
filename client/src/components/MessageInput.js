import React, { useState } from 'react';
import EmojiPicker from './EmojiPicker';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container p-6 border-t border-chat-border bg-chat-gray bg-opacity-50 backdrop-blur-sm relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            id="messageInput"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 bg-chat-dark border border-chat-border rounded-xl focus:outline-none focus:ring-2 focus:ring-chat-blue focus:border-transparent placeholder-gray-400 text-white transition-all duration-200"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-chat-blue to-chat-blue-light rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-chat-blue/30 transition-all duration-200"
          >
            <i className="fas fa-paper-plane text-white text-sm"></i>
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 bg-chat-dark hover:bg-chat-gray rounded-lg border border-chat-border transition-all duration-200 flex items-center justify-center group"
          >
            <i className="fas fa-smile text-gray-400 group-hover:text-white transition-colors"></i>
          </button>
          
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
