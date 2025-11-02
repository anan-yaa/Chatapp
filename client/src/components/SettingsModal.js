import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsModal = ({ user, onClose, onLogout }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ displayName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Display name updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to update display name');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
      console.error('Update error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-chat-blue bg-opacity-90 text-white rounded-2xl shadow-lg w-full max-w-md p-8 relative border border-chat-border animate-slideIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl focus:outline-none transition-colors"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>

        <form onSubmit={handleSubmit} className="mb-6">
          <label htmlFor="displayName" className="block text-white mb-2">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-chat-darker border border-chat-border text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
          />
          
          {message && (
            <div className={`mt-3 text-sm ${message.includes('success') ? 'text-green-300' : 'text-red-300'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 w-full bg-white hover:bg-gray-100 text-chat-blue font-semibold py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <hr className="my-6 border-white border-opacity-20" />

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
