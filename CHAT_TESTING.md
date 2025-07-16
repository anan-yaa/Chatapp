# ChatApp Testing Guide

## Quick Start

1. **Start the server:**

   ```bash
   npm start
   ```

2. **Open the app in your browser:**
   - Main app: http://localhost:3000
   - Login: http://localhost:3000/login
   - Signup: http://localhost:3000/signup

## Testing the Chat Functionality

### 1. Create Test Users

1. Go to http://localhost:3000/signup
2. Create at least 2 test users with different emails:
   - User 1: test1@example.com / password123
   - User 2: test2@example.com / password123

### 2. Test Login and Logout

1. Login with one of the test users
2. Verify the logout button appears in the top-right corner
3. Click logout and verify you're redirected to login page

### 3. Test Chat Functionality

1. **Login with User 1**
2. **Open browser console** (F12) to see debug logs
3. **Check the user list** - you should see User 2 in the sidebar
4. **Click on User 2** to start a chat
5. **Send a message** by typing in the input field and pressing Enter or clicking the send button
6. **Check console logs** for any errors

### 4. Test Real-time Messaging

1. **Open a second browser window/tab**
2. **Login with User 2**
3. **Select User 1** from the user list
4. **Send messages from both users** - they should appear in real-time

### 5. Debug Information

The app includes a debug script that automatically runs tests. Check the browser console for:

- 🔐 Authentication status
- 🔌 Socket connection status
- 🎨 UI element availability
- 🌐 API endpoint status

You can also manually run tests by typing in the console:

```javascript
window.debugChat.runAllTests();
```

## Common Issues and Solutions

### Messages Not Sending

- Check browser console for errors
- Verify Socket.IO connection is established
- Ensure you've selected a user to chat with

### Users Not Loading

- Check if you're logged in
- Verify the API endpoint is working
- Check browser console for authentication errors

### Socket Connection Issues

- Make sure the server is running
- Check if Socket.IO client is loaded
- Verify authentication token is valid

## Expected Behavior

✅ **Working Features:**

- User registration and login
- Logout functionality
- User list display
- Real-time messaging
- Message history
- Online/offline status
- Typing indicators
- Search functionality

✅ **UI Elements:**

- Logout button in header
- User list in sidebar
- Message input with send button
- Chat messages area
- Search input

## Testing Checklist

- [ ] Can register new users
- [ ] Can login with existing users
- [ ] Can logout and get redirected to login
- [ ] Can see other users in the user list
- [ ] Can select a user to start chatting
- [ ] Can send messages (Enter key and send button)
- [ ] Can receive messages in real-time
- [ ] Messages persist after page reload
- [ ] Socket connection is established
- [ ] No console errors

If all items are checked, the chat app is fully functional! 🎉
