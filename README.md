# 💬 Drift Chat Application

A modern, real-time chat application built with **TypeScript**, **Express**, **Socket.IO**, **MongoDB**, and **React**. Features secure authentication, AI-powered bot responses, emoji support, and a beautiful responsive UI.

## Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based user authentication with bcrypt password hashing
- 💬 **Real-time Messaging** - Instant messaging powered by Socket.IO
- 🤖 **Smart Bot Responses** - AI-powered bot users (Alice, Bob, Charlie, Diana) with contextual replies
- 👥 **User Management** - Online/offline status tracking, last seen timestamps
- 🎭 **Emoji Picker** - Native emoji support in messages
- 🔍 **Search Functionality** - Search through chats and messages
- ⚙️ **User Settings** - Customizable user preferences
- 🔔 **Notifications** - Real-time message notifications
- 📱 **Responsive Design** - Beautiful UI that works on all devices

### Security Features
- 🛡️ **Helmet.js** - HTTP security headers
- 🚦 **Rate Limiting** - Protection against brute-force attacks
- 🔒 **CORS Configuration** - Secure cross-origin requests
- 🔑 **Environment Variables** - Secure credential management

## 🏗️ Tech Stack

### Backend
- **Node.js** & **TypeScript** - Type-safe server-side JavaScript
- **Express.js** - Fast web framework
- **MongoDB** & **Mongoose** - NoSQL database with ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **express-rate-limit** - Rate limiting

### Frontend
- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Socket.IO Client** - Real-time updates
- **Tailwind CSS** - Utility-first styling
- **Font Awesome** - Icon library

## 📁 Project Structure

```
ChatApp/
├── src/                          # Backend source (TypeScript)
│   ├── server.ts                 # Main server file
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication middleware
│   ├── models/
│   │   ├── Message.ts            # Message schema
│   │   └── User.ts               # User schema
│   ├── routes/
│   │   ├── auth.ts               # Authentication routes
│   │   └── chat.ts               # Chat routes
│   ├── services/
│   │   ├── botService.ts         # AI bot logic
│   │   └── socket.ts             # Socket.IO service
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── utils/
│       ├── auth.ts               # Auth utilities
│       ├── database.ts           # Database utilities
│       └── mongodb.ts            # MongoDB connection
│
├── dist/                         # Compiled JavaScript output
│
├── client/                       # React frontend
│   ├── public/
│   │   ├── Drift logo.png
│   │   ├── Drift.png
│   │   ├── favicon.ico
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── AnimatedBackground.js
│       │   ├── ChatHeader.js
│       │   ├── ChatMessages.js
│       │   ├── EmojiPicker.js
│       │   ├── MessageInput.js
│       │   ├── SettingsModal.js
│       │   └── Sidebar.js
│       ├── context/
│       │   └── AuthContext.js    # Auth context provider
│       ├── pages/
│       │   ├── Chat.js
│       │   ├── Login.js
│       │   └── Signup.js
│       ├── App.js
│       ├── index.js
│       └── index.css
│
├── .env                          # Environment variables
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChatApp
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/chatapp
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chatapp

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Optional: Enable bot service
   ENABLE_BOTS=true
   ```

5. **Build the TypeScript backend**
   ```bash
   npm run build
   ```

### Running the Application

#### Development Mode

1. **Start the backend server** (with hot reload)
   ```bash
   npm run watch
   ```
   Backend runs on `http://localhost:3000`

2. **Start the React frontend** (in a new terminal)
   ```bash
   cd client
   npm start
   ```
   Frontend runs on `http://localhost:3001`

#### Production Mode

1. **Build both backend and frontend**
   ```bash
   # Build backend
   npm run build

   # Build frontend
   cd client
   npm run build
   cd ..
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📝 Available Scripts

### Backend Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled production server
- `npm run dev` - Run with ts-node (development)
- `npm run watch` - Run with nodemon (auto-restart)
- `npm run migrate` - Run database migrations

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Chat
- `GET /api/chat/users` - Get all users
- `GET /api/chat/messages/:userId` - Get messages with a specific user
- `POST /api/chat/messages` - Send a message
- `PUT /api/chat/messages/:id/read` - Mark message as read
- `DELETE /api/chat/messages/:id` - Delete a message

### Health Check
- `GET /api/health` - Server health status

## 🔐 Socket.IO Events

### Client → Server
- `message` - Send a message
- `typing` - User is typing
- `read` - Mark messages as read
- `disconnect` - User disconnected

### Server → Client
- `message` - Receive a message
- `typing` - Someone is typing
- `online` - User came online
- `offline` - User went offline

## 🤖 Bot Service

The application includes AI-powered bot users that respond to specific triggers:

- **Alice** - Friendly and helpful responses
- **Bob** - Technical and analytical responses
- **Charlie** - Casual and humorous responses
- **Diana** - Professional and concise responses

Bots automatically respond to keywords like "hello", "help", "weather", "time", etc.

## 🎨 Customization

### Styling
The frontend uses **Tailwind CSS**. Modify `client/tailwind.config.js` to customize the theme:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      }
    }
  }
}
```

### Bot Responses
Edit `src/services/botService.ts` to customize bot behaviors and responses.

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For MongoDB Atlas, ensure IP whitelist is configured

### Socket.IO Connection Errors
- Verify backend is running on correct port
- Check CORS configuration in `src/server.ts`
- Ensure JWT token is valid

### Build Errors
- Clear build cache: `rm -rf dist/ client/build/`
- Reinstall dependencies: `rm -rf node_modules/ && npm install`

