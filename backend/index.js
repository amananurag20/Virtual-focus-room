/**
 * Virtual Focus Room - Backend Server
 * 
 * A real-time collaboration server for video rooms using Socket.io and WebRTC signaling
 */

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Configuration
const config = require("./config");
const { setupSocketHandlers } = require("./handlers/socketHandlers");

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: config.cors
});

// Socket connection handler
io.on("connection", (socket) => {
    setupSocketHandlers(io, socket);
});

// Start server
httpServer.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════╗
║     Virtual Focus Room Server Started      ║
╠════════════════════════════════════════════╣
║  Port: ${config.port}                               ║
║  Health: http://localhost:${config.port}/health      ║
╚════════════════════════════════════════════╝
    `);
});