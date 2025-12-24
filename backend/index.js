/**
 * Virtual Focus Room - Backend Server
 * 
 * A real-time collaboration server for video rooms using Socket.io and WebRTC signaling
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const roomManager = require('./utils/roomManager');
const { setupSocketHandlers } = require('./handlers/socketHandlers');
const authRoutes = require('./routes/authRoutes');
const tierRoutes = require('./routes/tierRoutes');
const todoRoutes = require('./routes/todoRoutes');
const statsRoutes = require('./routes/statsRoutes');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware

app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/focusroom';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('⚠️ Running without database persistence for now.');
    });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176"
        ],
        methods: ["GET", "POST"]
    }
});

// Socket connection handler
io.on("connection", (socket) => {
    setupSocketHandlers(io, socket);
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     Virtual Focus Room Server Started      ║
╠════════════════════════════════════════════╣
║  Port: ${PORT}                                ║
║  Health: http://localhost:${PORT}/health      ║
╚════════════════════════════════════════════╝
`);
});