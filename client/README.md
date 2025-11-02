# Drift Chat Application - React Frontend

This is the React frontend for the Drift chat application, converted from HTML/Tailwind CSS to a modern React application with routing and state management.

## Features

- 🔐 User authentication (Login/Signup)
- 💬 Real-time chat with Socket.IO
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Responsive design
- 🎭 Emoji picker
- ⚙️ User settings
- 🔍 Chat search functionality

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Navigation
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Font Awesome** - Icons

## Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Make sure the backend server is running on `http://localhost:3000`

2. Start the React development server:
```bash
npm start
```

The application will open at `http://localhost:3001` (or another port if 3001 is busy).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
client/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── images/          # Place your images here
├── src/
│   ├── components/
│   │   ├── AnimatedBackground.js
│   │   ├── ChatHeader.js
│   │   ├── ChatMessages.js
│   │   ├── EmojiPicker.js
│   │   ├── MessageInput.js
│   │   ├── SettingsModal.js
│   │   └── Sidebar.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Chat.js
│   │   ├── Login.js
│   │   └── Signup.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Configuration

### API Endpoint
Update the API endpoint in the components if your backend runs on a different URL:
- Login: `src/pages/Login.js`
- Signup: `src/pages/Signup.js`
- Chat: `src/pages/Chat.js`
- Settings: `src/components/SettingsModal.js`

### Socket.IO Connection
Configure the Socket.IO server URL in `src/pages/Chat.js`:
```javascript
const newSocket = io('http://localhost:3000', {
  auth: { token },
});
```

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. The optimized build will be in the `build/` directory

3. You can serve it with any static file server:
```bash
npx serve -s build
```

## Environment Variables

Create a `.env` file in the client directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000
```

Then update the code to use these variables:
```javascript
const API_URL = process.env.REACT_APP_API_URL;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure your backend server has CORS configured to accept requests from `http://localhost:3001`.

### Socket.IO Connection
If Socket.IO doesn't connect, verify:
1. Backend server is running
2. Socket.IO server is properly configured
3. Authentication token is being sent correctly

### Styling Issues
If Tailwind styles don't appear:
1. Make sure `tailwind.config.js` is properly configured
2. Verify `index.css` has the Tailwind directives
3. Restart the development server

## License

MIT
