const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store rooms and users
const rooms = new Map();
const users = new Map();

// Helper to get room data
function getRoomData(roomId) {
    const room = rooms.get(roomId);
    if (!room) return null;

    const participants = Array.from(room.participants.values()).map(user => ({
        odId: user.socketId,
        username: user.username,
        isAudioOn: user.isAudioOn,
        isVideoOn: user.isVideoOn
    }));

    return {
        id: roomId,
        name: room.name,
        participants,
        createdAt: room.createdAt
    };
}

// Get all active rooms
function getAllRooms() {
    const roomList = [];
    rooms.forEach((room, roomId) => {
        roomList.push({
            id: roomId,
            name: room.name,
            participantCount: room.participants.size,
            createdAt: room.createdAt
        });
    });
    return roomList;
}

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Send current rooms list on connect
    socket.emit("rooms:list", getAllRooms());

    // Create a new room
    socket.on("room:create", ({ roomName, username }, callback) => {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const room = {
            name: roomName || `Room ${roomId.slice(-4)}`,
            participants: new Map(),
            messages: [],
            createdAt: new Date().toISOString()
        };

        rooms.set(roomId, room);

        // Auto-join the creator
        const userData = {
            socketId: socket.id,
            username: username || `User_${socket.id.slice(-4)}`,
            roomId,
            isAudioOn: true,
            isVideoOn: true
        };

        room.participants.set(socket.id, userData);
        users.set(socket.id, userData);
        socket.join(roomId);

        console.log(`Room created: ${roomId} by ${userData.username}`);

        // Notify all clients about new room
        io.emit("rooms:list", getAllRooms());

        callback({ success: true, roomId, room: getRoomData(roomId) });
    });

    // Join existing room
    socket.on("room:join", ({ roomId, username }, callback) => {
        const room = rooms.get(roomId);

        if (!room) {
            callback({ success: false, error: "Room not found" });
            return;
        }

        const userData = {
            socketId: socket.id,
            username: username || `User_${socket.id.slice(-4)}`,
            roomId,
            isAudioOn: true,
            isVideoOn: true
        };

        room.participants.set(socket.id, userData);
        users.set(socket.id, userData);
        socket.join(roomId);

        console.log(`${userData.username} joined room: ${roomId}`);

        // Notify others in room about new user
        socket.to(roomId).emit("user:joined", {
            socketId: socket.id,
            username: userData.username
        });

        // Update rooms list for all
        io.emit("rooms:list", getAllRooms());

        callback({
            success: true,
            room: getRoomData(roomId),
            existingUsers: Array.from(room.participants.entries())
                .filter(([id]) => id !== socket.id)
                .map(([id, user]) => ({ socketId: id, username: user.username }))
        });
    });

    // Leave room
    socket.on("room:leave", () => {
        const user = users.get(socket.id);
        if (!user) return;

        const room = rooms.get(user.roomId);
        if (room) {
            room.participants.delete(socket.id);
            socket.to(user.roomId).emit("user:left", { socketId: socket.id });
            socket.leave(user.roomId);

            // Delete room if empty
            if (room.participants.size === 0) {
                rooms.delete(user.roomId);
                console.log(`Room deleted: ${user.roomId} (empty)`);
            }

            io.emit("rooms:list", getAllRooms());
        }

        users.delete(socket.id);
    });

    // WebRTC Signaling - Offer
    socket.on("webrtc:offer", ({ to, offer }) => {
        const user = users.get(socket.id);
        socket.to(to).emit("webrtc:offer", {
            from: socket.id,
            username: user?.username,
            offer
        });
    });

    // WebRTC Signaling - Answer
    socket.on("webrtc:answer", ({ to, answer }) => {
        socket.to(to).emit("webrtc:answer", {
            from: socket.id,
            answer
        });
    });

    // WebRTC Signaling - ICE Candidate
    socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
        socket.to(to).emit("webrtc:ice-candidate", {
            from: socket.id,
            candidate
        });
    });

    // Toggle media state
    socket.on("media:toggle", ({ type, enabled }) => {
        const user = users.get(socket.id);
        if (!user) return;

        if (type === "audio") {
            user.isAudioOn = enabled;
        } else if (type === "video") {
            user.isVideoOn = enabled;
        }

        socket.to(user.roomId).emit("user:media-toggle", {
            socketId: socket.id,
            type,
            enabled
        });
    });

    // Chat message
    socket.on("chat:message", ({ message }) => {
        const user = users.get(socket.id);
        if (!user) return;

        const room = rooms.get(user.roomId);
        if (!room) return;

        const chatMessage = {
            id: `msg_${Date.now()}`,
            socketId: socket.id,
            username: user.username,
            message,
            timestamp: new Date().toISOString()
        };

        room.messages.push(chatMessage);

        // Keep only last 100 messages
        if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100);
        }

        io.to(user.roomId).emit("chat:message", chatMessage);
    });

    // Ping user
    socket.on("user:ping", ({ targetSocketId }) => {
        const user = users.get(socket.id);
        if (!user) return;

        socket.to(targetSocketId).emit("user:pinged", {
            from: socket.id,
            username: user.username
        });
    });

    // Connection request
    socket.on("request:send", ({ targetSocketId, message }) => {
        const user = users.get(socket.id);
        if (!user) return;

        socket.to(targetSocketId).emit("request:received", {
            from: socket.id,
            username: user.username,
            message
        });
    });

    // Request response
    socket.on("request:respond", ({ targetSocketId, accepted }) => {
        const user = users.get(socket.id);
        if (!user) return;

        socket.to(targetSocketId).emit("request:response", {
            from: socket.id,
            username: user.username,
            accepted
        });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        const user = users.get(socket.id);
        if (user) {
            const room = rooms.get(user.roomId);
            if (room) {
                room.participants.delete(socket.id);
                socket.to(user.roomId).emit("user:left", { socketId: socket.id });

                // Delete room if empty
                if (room.participants.size === 0) {
                    rooms.delete(user.roomId);
                    console.log(`Room deleted: ${user.roomId} (empty)`);
                }

                io.emit("rooms:list", getAllRooms());
            }
            users.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});