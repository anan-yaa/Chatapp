import React, { useState } from 'react';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐'],
    gestures: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '💎', '💍', '🌹', '🌺', '🌻', '🌷', '🌸', '💐'],
  };

  return (
    <div
      className="absolute bottom-full right-0 mb-2 bg-chat-dark border border-chat-border rounded-xl shadow-xl overflow-hidden"
      style={{ zIndex: 1000, width: '320px' }}
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center p-2 border-b border-chat-border bg-chat-darker">
        <span className="text-gray-400 text-sm font-medium">Emojis</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Emoji Categories */}
      <div className="flex border-b border-chat-border">
        <button
          className={`emoji-category-btn p-2 flex-1 text-sm font-medium transition-colors ${
            activeCategory === 'smileys' ? 'text-chat-blue' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveCategory('smileys')}
        >
          <i className="fas fa-smile"></i>
        </button>
        <button
          className={`emoji-category-btn p-2 flex-1 text-sm font-medium transition-colors ${
            activeCategory === 'gestures' ? 'text-chat-blue' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveCategory('gestures')}
        >
          <i className="fas fa-hand-peace"></i>
        </button>
        <button
          className={`emoji-category-btn p-2 flex-1 text-sm font-medium transition-colors ${
            activeCategory === 'hearts' ? 'text-chat-blue' : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveCategory('hearts')}
        >
          <i className="fas fa-heart"></i>
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="emoji-grid p-2 grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
        {emojiCategories[activeCategory].map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="text-2xl hover:bg-chat-gray rounded p-1 transition-all duration-200 hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
